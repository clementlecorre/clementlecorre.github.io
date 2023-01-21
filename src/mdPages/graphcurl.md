<br /><br/>
# A tool to make graphQL queries easily

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/GraphcurlAtHabx/logo.png" alt="shoebox-overview-0"/>
</div>
<em>Logo from graph-gophers</em></br></br>

<strong>Source</strong>: https://github.com/habx/graphcurl

<strong>Doc CLI</strong>: https://github.com/habx/graphcurl/blob/dev/docs/graphcurl.md

## Introduction

At [Habx](https://www.habx.com) we massively use [Argo](https://argoproj.github.io) for all 3D processings.
We decided to have a GraphQL APIs based architecture. [GraphQL APIs](https://graphql.org).
In DevOps, it’s not always an easy task to use GraphQL with [curl](https://curl.se)  for complex queries. All of our workflows interact with our microservices for “real time” monitoring. Therefore, we have a strong need to create Argo templates that can leverage GraphQL queries.

The standard usage with [curl](https://curl.se) was really difficult to maintain so I decided to create a simpler and easier tool to use.

I did some tests on another open source project [hasura/graphqurl](https://github.com/hasura/graphqurl) :

  * it is impossible to use `jq` with pipe so there is no silent mode.

  * The query format must absolutely be in “one line”.

  * We can’t use nested keys with a specific format.

## Features

### Query from file

Get users (demo API)
\```bash
$ cat /tmp/get_users.graphql
query {
  users(distinct_on: name, limit: 3) {
    id
    name
  }
}
$ ./graphcurl post -u=https://api.spacex.land/graphql/ --file-path /tmp/get_users.graphql
```

### Silent Mode

Get users with silent mode (demo API)
```bash
$ ./graphcurl post -u=https://api.spacex.land/graphql/ --file-path /tmp/get_users.graphql -s | jq
{
  "users": [
    {
      "id": "78eb3d1f-a18e-4da5-bac4-297cb814804f",
      "name": ""
    },
    {
      "id": "9a493a38-63e7-475a-a3cc-8cb945098c9a",
      "name": "🍔"
    },
    {
      "id": "04e03eae-4238-48be-846e-8dbf1b4ed177",
      "name": "06fbro6paq"
    }
  ]
}
```

### Variables from file and nested structure

Get users with silent mode (demo API)
```bash
$ cat /tmp/insert_user.graphql
mutation($payload: [users_insert_input!]!) {
  insert_users(objects: $payload) {
    affected_rows
    returning {
      id
      name
    }
  }
}
$ cat /tmp/insert_user_vars.graphql
{
  "name": "clement-test01"
}
```

```bash
./graphcurl post -u=https://api.spacex.land/graphql/ --file-path /tmp/insert_user.graphql --variables-from-file='payload=/tmp/insert_user_vars.json'
Exec http request	{"commands": "post", "URL": "https://api.spacex.land/graphql/"}
{"insert_users":{"affected_rows":1,"returning":[{"id":"5a7acf1a-9630-45e2-b9eb-ce482018f97f","name":"clement-test01"}]}}
```

### Variables and nested struct

```bash
./graphcurl post -u=https://api.spacex.land/graphql/ --file-path /tmp/insert_user.graphql -V='payload.name=clement-test'
```

### Argo usage example

Here are some examples when using Argo.

#### Create template

Create new template
```bash
$ argo template create demo.yaml
```

```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: demo-api
spec:
  templates:
  - name: get-users
    inputs:
      parameters:
      - name: version
        value: "v0.0.1"
      - name: loglevel
        value: "debug"
      - name: limit
        value: "3"
    script:
      image: habx/graphcurl:{{inputs.parameters.version}}
      command: [sh]
      source: |
        cat << 'END_OF_FILE' > /tmp/query.graphql
        query {
          users(distinct_on: name, limit: {{inputs.parameters.limit}}) {
            id
            name
          }
        }
        END_OF_FILE
        ./graphcurl_linux_amd64 post \
          --loglevel={{inputs.parameters.loglevel}} \
          -u=https://api.spacex.land/graphql/ \
          -H "accept=application/json" \
          -A "argo/{{workflow.name}}" \
          -f /tmp/query.graphql
      resources:
        limits:
          memory: 32Mi
          cpu: 0.3
```

#### Workflow example

Submit workflow
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: demo-api-example-
spec:
  entrypoint: get-users
  templates:
  - name: get-users
    dag:
      tasks:
        - name: get-users
          templateRef:
            name: demo-api
            template: get-users
          arguments:
            parameters:
              - name: version
                value: "v0.0.1"
```


```bash
argo submit demo.test.yaml
```


#### Workflow Result

Workflow
```bash
argo -n dev-argo get demo-api-example-k6qlq
Name:                demo-api-example-k6qlq
Namespace:           default
ServiceAccount:      default
Status:              Running
Created:             Thu Jul 01 15:58:09 +0200 (10 seconds ago)
Started:             Thu Jul 01 15:58:09 +0200 (10 seconds ago)
Duration:            10 seconds
Progress:            0/1

STEP                       TEMPLATE            PODNAME                            DURATION  MESSAGE
 ● demo-api-example-k6qlq  get-users
 └─◷ get-users             demo-api/get-users  demo-api-example-k6qlq-1834040069  10s
```

Logs
```bash
demo-api-example-k6qlq-1834040069: 2021-07-01T15:58:14.457+0200	DEBUG	post/command.go:79	Merged variables	{"commands": "post", "variables": {}}
demo-api-example-k6qlq-1834040069: 2021-07-01T15:58:14.457+0200	INFO	post/command.go:88	Exec http request	{"commands": "post", "URL": "https://api.spacex.land/graphql/"}
demo-api-example-k6qlq-1834040069: 2021-07-01T15:58:14.457+0200	DEBUG	graphrequest/post.go:45	Request: >> variables: map[]	{"commands": "post"}
demo-api-example-k6qlq-1834040069: 2021-07-01T15:58:14.457+0200	DEBUG	graphrequest/post.go:45	Request: >> query: query {
demo-api-example-k6qlq-1834040069:   users(distinct_on: name, limit: 3) {
demo-api-example-k6qlq-1834040069:     id
demo-api-example-k6qlq-1834040069:     name
demo-api-example-k6qlq-1834040069:   }
demo-api-example-k6qlq-1834040069: }
demo-api-example-k6qlq-1834040069: 	{"commands": "post"}
demo-api-example-k6qlq-1834040069: 2021-07-01T15:58:14.457+0200	DEBUG	graphrequest/post.go:45	Request: >> headers: map[Accept:[application/json; charset=utf-8 application/json] Content-Type:[application/json; charset=utf-8] User-Agent:[argo/demo-api-example-k6qlq]]	{"commands": "post"}
demo-api-example-k6qlq-1834040069: 2021-07-01T15:58:14.770+0200	DEBUG	graphrequest/post.go:45	Request: << {"data":{"users":[{"id":"78eb3d1f-a18e-4da5-bac4-297cb814804f","name":""},{"id":"9a493a38-63e7-475a-a3cc-8cb945098c9a","name":"🍔"},{"id":"04e03eae-4238-48be-846e-8dbf1b4ed177","name":"06fbro6paq"}]}}
demo-api-example-k6qlq-1834040069: 	{"commands": "post"}
demo-api-example-k6qlq-1834040069: {"users":[{"id":"78eb3d1f-a18e-4da5-bac4-297cb814804f","name":""},{"id":"9a493a38-63e7-475a-a3cc-8cb945098c9a","name":"🍔"},{"id":"04e03eae-4238-48be-846e-8dbf1b4ed177","name":"06fbro6paq"}]}
```

## Conclusion

We now have a simpler tool to facilitate GraphQL queries for our workflows. Feel free to use this tool as a client too!


<strong>Source</strong>: https://github.com/habx/graphcurl