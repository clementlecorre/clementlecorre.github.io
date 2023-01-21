<br /><br/>
# Scheduled & distributed Cypress tests for multiple environments & clients with Argo

[Cypress](https://www.cypress.io/) is an amazing testing tool for end-to-end testing.
It integrated perfectly with our GitHub pull requests workflow and we wanted to move a step further: Test our code once it's deployed.

This article will present how we orchestrate Cypress tests on various client apps and across our different deployment environments using
[Argo](https://github.com/argoproj/argo).

## Our testing architecture

We have 3 environments: *dev*, *staging*, and *prod*.
We have 3 layers of testings:

* **At every PR**  using [CircleCI](https://docs.cypress.io/guides/guides/continuous-integration.html).
Only a subset of our tests is run to keep the testing step fast. The client app is loaded in a CircleCI machine and is tested by Cypress.

* When we **release** a client (dev to staging), this time we run all test suites on the *dev* environment.

* **Every day at 00:00**, all test suites run on *staging* and *prod*  environments.

Each test failure is reported to us through a slack notification.

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
    <img src="./images/portfolio/CypressAtHabx/slack-notification.png" alt="slack-notification"/>
</div> 
<br />

We won't explain how we test our code with CircleCI and Cypress since their [documentation](https://docs.cypress.io/guides/guides/continuous-integration.html) is already doing a great job at that.

## Distributed & scheduled tests

At habx, we have 13 clients and 2 environments to test with different *record-keys* & *path*. So we needed a reliable and scalable tool to run our tests. We choose Argo.

### Why Argo ?

[Argo](https://github.com/argoproj/argo) was already widely used at habx. It matches our needs of scalability around various multi-steps workflows and keeps helps us keep it under budget with the use of AWS spot instances.

Argo is based on Kubernetes which makes it robust and easy to set up on an existing Kubernetes cluster. The project is young but with a very promising future as it has just [joined the CNCF](https://landscape.cncf.io/selected=argo) and has already been adopted by [many companies](https://github.com/argoproj/argo/blob/master/USERS.md).

Here our Argo workflow allows us to easily add new components to the continuous tests using the JSON config example below.

<br />

##### Json config

<br />

Minimalist and simple configuration.
```json
[
    { "client-name": "clientA", "path": "/client-a", "record-key": "XXXX" },
    { "client-name": "clientB", "path": "/client-b", "record-key": "XXXX" }
]
```

### Implementing our workflow

#### Argo workflow tree

<br />
Here is what our final workflow will look like:
<br />
<br />

<img src="./images/portfolio/CypressAtHabx/argo-tree.png" alt="argo-tree"/>

<br />


#### Argo workflow step by step

<br />


To run our tests, we need multiple steps for each run:

* Install dependencies (cypress & test suites dependencies like cypress-image-snapshot). 

We cache on S3 the node modules to keep things fast

* Clone client tests of the current version in different environments.

* Fetch our app version.

We have an internal script that fetches the version of our app.

* Run tests

With Argo [DAG-based](https://en.wikipedia.org/wiki/Directed_acyclic_graph) config syntax, it's easier to start by configuring the leaf of the workflow. Here is a sample test task:

````yaml
- name: test
    arguments: {}
    inputs:
        parameters:
            - name: client-name
            - name: version
            - name: record-key
            - name: env
            - name: baseUrl
            - name: source
    container:
        name: ''
        image: 'cypress/browsers:node12.6.0-chrome77'
        command:
            - /bin/sh
            - '-c'
        args:
            - >-
                npx cypress run --project ./work --record --key
                {{inputs.parameters.record-key}} --tag
                {{inputs.parameters.version}},{{inputs.parameters.env}} --config
                baseUrl={{inputs.parameters.baseUrl}} numTestsKeptInMemory=0

````

⚠️ Do not forget to mount the `/dev/shm` volume. This avoids some memory limitation issues you would otherwise quickly face.

```yaml
      volumes:
      - name: dshm
        emptyDir:
          medium: Memory
      container:
        volumeMounts:
          - mountPath: /dev/shm
            name: dshm
```

So we know that we need 6 inputs which are *client-name*, *version*, *record-key*, *env*, *baseUrl* & *source*

We can also use the target GitHub repository in this task with the following artifact in inputs:

```yaml
 artifacts:
    - name: source
        path: /work
        git:
            repo: 'git@github.com:habx/{{inputs.parameters.client-name}}'
            revision: '{{inputs.parameters.version}}'
            sshPrivateKeySecret:
                name: 'argo-ssh-private-key-{{inputs.parameters.client-name}}'
                key: ssh-private-key
```

<br />

### Result

<br />

Here is what we get with the Argo template we just built.

<br />

##### Argo workflow source

```yaml
apiVersion: argoproj.io/v1alpha1
kind: CronWorkflow
metadata:
  name: cypress-tests
  labels:
    workflows.argoproj.io/controller-instanceid: my-argo-instance
spec:
  schedule: '0 2 * * *'
  concurrencyPolicy: "Replace"
  startingDeadlineSeconds: 0
  failedJobsHistoryLimit: 4
  suspend: false
  timezone: "Europe/Paris"
  workflowSpec:
    entrypoint: clients
    templates:
    - name: clients
      dag:
        tasks:
        - name: install-dependencies
          template: install-dependencies
        - name: client
          dependencies: [install-dependencies]
          template: client
          arguments:
            parameters: [{name: client-name, value: "{{item.client-name}}" }, {name: client-path, value: "{{item.path}}" }, {name: record-key, value: "{{item.record-key}}" }]
          withItems: [
              { 'client-name': 'auth', path: '/a', 'record-key': 'a' },
              { 'client-name': 'auth2', path: '/b', 'record-key': 'b' }
          ]
    - name: client
      inputs:
        parameters:
        - name: client-name
        - name: client-path
        - name: record-key
      dag:
        tasks:
        - name: run-client-tests
          template: envs
          arguments:
            parameters:
              - name: client-name
                value: "{{inputs.parameters.client-name}}"
              - name: env
                value: "{{item.env}}"
              - name: client-path
                value: "{{inputs.parameters.client-path}}"
              - name: baseUrl
                value: "{{item.url}}"
              - name: record-key
                value: "{{inputs.parameters.record-key}}"
          withItems:
          - { env: "prod-example", url: "https://domain.com" }
          - { env: "staging-example", url: "https://domain.com" }
    - name: envs
      inputs:
        parameters:
        - name: client-name
        - name: baseUrl
        - name: client-path
        - name: env
        - name: record-key
      steps:
      - - name: fetch-version
          template: fetch-version
          arguments:
            parameters:
              - name: baseUrl
                value: "{{inputs.parameters.baseUrl}}"
              - name: client-path
                value: "{{inputs.parameters.client-path}}"
      - - name: test
          template: test
          arguments:
            parameters:
            - name: version
              value: "{{steps.fetch-version.outputs.parameters.version}}"
            - name: client-name
              value: "{{inputs.parameters.client-name}}"
            - name: baseUrl
              value: "{{inputs.parameters.baseUrl}}"
            - name: record-key
              value: "{{inputs.parameters.record-key}}"
            - name: env
              value: "{{inputs.parameters.env}}"
    - name: fetch-version
      inputs:
        parameters:
        - name: baseUrl
        - name: client-path
      container:
        image: argoproj/argoexec:latest
        command: ["/bin/sh", "-c"]
        args: ["echo 'magic script here' > /tmp/version.txt"]
        resources:
          limits:
            memory: 32Mi
            cpu: 1000m
      outputs:
        parameters:
        - name: version
          valueFrom:
            default: "1.0.0"
            path: /tmp/version.txt
    - name: install-dependencies
      inputs:
        artifacts:
        - name: node_modules
          path: /work/node_modules
          s3:
            key: "cypress/install-dependencies/node_modules"
      outputs:
        artifacts:
        - name: node_modules
          path: /node_modules
          s3:
            key: "cypress/install-dependencies/node_modules"
      container:
        image: cypress/base:12
        command: ["/bin/sh", "-c"]
        args: ['npm i cypress']
        resources:
          requests:
            memory: 2000Mi
            cpu: 1000m
          limits:
            memory: 2000Mi
            cpu: 2000m

    - name: test
      inputs:
        artifacts:
        - name: node_modules
          path: /work/node_modules
          s3:
            key: "cypress/install-dependencies/node_modules"
        - name: source
          path: /work
          git:
            repo: "git@github.com:habx/{{inputs.parameters.client-name}}"
            revision: "{{inputs.parameters.version}}"
            sshPrivateKeySecret:
              name: argo-ssh-private-key-{{inputs.parameters.client-name}}
              key: ssh-private-key
        parameters:
        - name: client-name
        - name: version
        - name: record-key
        - name: env
        - name: baseUrl
      volumes:
      - name: dshm
        emptyDir:
          medium: Memory
      container:
        image: cypress/browsers:node12.6.0-chrome77
        command: ["/bin/sh", "-c"]
        args:
            - >-
                npx cypress run --project ./work --record --key
                {{inputs.parameters.record-key}} --tag
                {{inputs.parameters.version}},{{inputs.parameters.env}} --config
                baseUrl={{inputs.parameters.baseUrl}} numTestsKeptInMemory=0

        volumeMounts:
          - mountPath: /dev/shm
            name: dshm
        resources:
          limits:
            memory: 8Gi
            cpu: 4
          requests:
            memory: 4Gi
            cpu: 2
```

<br />

#### CircleCI Example

<br />

We use CircleCI's [ORB for cypress](https://circleci.com/orbs/registry/orb/cypress-io/cypress).

```yaml
- cypress/run:
    pre-steps:
    - checkout
    install-command: 'npx cypress install'
    group: 'all tests'  # name this group "all tests" on the dashboard
    start: 'CI=true npm start' # https://github.com/facebook/create-react-app/issues/8688#issuecomment-602678446
    wait-on: 'http-get://localhost:3013'
    command: npx cypress run --record --key ${CYPRESS_KEY}
    no-workspace: true
```

## Conclusion

Within a few weeks, Cypress with CircleCI proved to be a great solution for pull-request based tests. We still had bugs that did occur in production, mostly because of a different set of data, a slightly different code - or even infrastructure - behavior.
Scheduling Argo-orchestrated workflow running Cypress in staging and production helped us find a few of these bugs before anyone else discovered them.
Additionally, it provides an end-to-end way to completely check the correct behavior of your stack which can be a challenge in micro-service architecture.

Once correctly set up, Argo ended up being the perfect tool for our Cypress test architecture.
