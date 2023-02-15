<br /><br/>

# Argo Feedback after 2 Year used at Habx

## Introductions

Habx sells 3D views through its SaaS tool and therefore has a massive need for calculation, which requires the industrialization of processes. In order to meet the high standards of 3D production, a software tool for workflow orchestration must be implemented. Workflows must be dynamic and adaptable to input parameters.

After conducting several benchmarks, Habx decided to use Argo Workflow, despite the project being relatively new.

After testing the first use-case, it was found that Argo Workflow was easy to use, simple to maintain, and based on Kubernetes.

## Envs

There are three Argo Workflow environments at Habx that are used to test version upgrades. These can be risky as the product is still relatively young.

## A few numbers


### Gets workflows informations from Argo Workflow database

**Create new table**

```sql
CREATE TABLE workflow_nodes (
  node_id SERIAL PRIMARY KEY,
  workflow_uid VARCHAR(128) NOT NULL,
  node_name VARCHAR(256) NOT NULL,
  node_type VARCHAR(50),
  node_phase VARCHAR(25)
);
CREATE INDEX idx_workflow_nodes_node_name_type ON workflow_nodes (node_name, node_type);
```

**Migrate all data to workflow_nodes**

```sql
DO $$
DECLARE
  workflow record;
  node_record record;
  node_type text;
  node_phase text;
BEGIN
  FOR workflow IN SELECT uid, name, workflow_jsonb FROM argo_archived_workflows
  LOOP
    FOR node_record IN SELECT * FROM jsonb_array_elements(workflow.workflow_jsonb -> 'status' -> 'nodes')
    LOOP
      node_type = node_record ->> 'type';
      node_phase = node_record ->> 'phase';
      INSERT INTO workflow_nodes (workflow_uid, node_name, node_type, node_phase)
      VALUES (workflow.uid, node_record ->> 'name', node_type, node_phase);
    END LOOP;
  END LOOP;
END $$;

```

**They are 4 types of workflows in our database**

* 👉 Orbital workflows - Click to Watch!</br>
[![Orbital](http://img.youtube.com/vi/ubfasuNxKcA/0.jpg)](https://youtu.be/ubfasuNxKcA)
* 👉 Panoramas workflows - Click to Watch!</br>
[![Panoramas](http://img.youtube.com/vi/jMRxthB43Bk/0.jpg)](https://youtu.be/jMRxthB43Bk)
* 👉 Bakes workflows - Click to Watch!</br>
[![Duplexe](http://img.youtube.com/vi/NHRzXfCfWl0/0.jpg)](https://youtu.be/NHRzXfCfWl0)
[![Classic](http://img.youtube.com/vi/-9jztFtkeq0/0.jpg)](https://youtu.be/-9jztFtkeq0)
* 👉 Model 2d processing workflows, image compressing</br>

**Count workflows jobs**

```sql
SELECT count(*)
    FROM public.workflow_nodes
        WHERE node_name LIKE '%bake%'
        AND node_phase = 'Succeeded'
        AND node_type = 'Pod';
```

**Count workflows**

```sql
SELECT count(*)
    FROM public.argo_archived_workflows
        WHERE argo_archived_workflows.name LIKE '%bakes%';
```
</br>

### Total workflows

| Environment | Workflows | Jobs    |
| ----------- | --------- | ------- |
| prod        | 41244     | 933 567 |
</br>

### Total by type of workflows

| Environment | type    | Workflows | Jobs    |
| ----------- | ------- | --------- | ------- |
| prod        | pano    | 17 426    | 365 202 |
| prod        | models  | 8690      | 51 521  |
| prod        | bake    | 596       | 173 192 |
| prod        | orbital | 289       | 248 017 |


## Massive template usage

Habx uses a lot of templates and utilizes them in many workflows. They use a pattern based on GitHub and continuous deployment.

The documentation is auto-generated with python script: https://github.com/habx/argo-templates-autodoc

```bash
├── WorkflowTemplate
│   ├── aws
│   │   └── s3.yaml
│   ├── dag
│   │   └── global
│   │       └── workflow-fail-slack-notify.yaml
│   ├── habx
│   │   ├── bake
│   │   │   └── core.yaml
│   │   ├── devopstool
│   │   │   ├── bakes.yaml
│   │   │   ├── sentry.yaml
│   │   │   └── url.yaml
│   │   ├── orbital
│   │   │   ├── core-dag.yaml
│   │   │   ├── core-mid-dag.yaml
│   │   │   ├── core.yaml
│   │   │   └── get-csm-for-project.yaml.test
│   │   ├── panoramas
│   │   │   ├── core-dag.yaml
│   │   │   ├── core.yaml
│   │   │   └── manifest.yaml
│   │   ├── services
│   │   │   ├── bake.yaml
│   │   │   ├── feature.yaml
│   │   │   ├── feature.yaml.test
│   │   │   ├── habxops.yaml
│   │   │   ├── layouts-enricher.yaml
│   │   │   ├── models.yaml
│   │   │   ├── panoramas.yaml
│   │   │   ├── projects-dag.yaml
│   │   │   ├── projects-dag.yaml.test
│   │   │   ├── projects.yaml
│   │   │   └── projects.yaml.test
│   │   ├── sync
│   │   │   └── gdrive.yaml

...
```

**Example of architecture:**

orbital/core.yaml is used by orbital/core-mid-dag.yaml and orbital/core-dag.yaml and finally by service-orbital/workflow.yaml

</br>

# Conclusion

We are very satisfied with Argo Workflow. We have a lot of use-cases and we are very happy to use it. We are looking forward to the next version of Argo Workflow. We have processed about 1M tasks across 40,000 workflows. We are very happy with the performance of Argo Workflow. Argo is kube-native and we are very happy to use it.

