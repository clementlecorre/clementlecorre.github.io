<br /><br/>
# How to industrialize 3D calculations at Habx

## Introduction

One of our offerings at [Habx](https://www.habx.com) includes generating 3D shoebox views of housings.

For each real-estate program, we have between 40 and 120 lots each having 2 to 20 alternative layouts. An average program has 50 lots with 5 alternatives each. This results in generating 3D views (with the light) for 100 to 800 shoeboxes rendering per program.

The rendering of one shoebox bake takes between 10 and 40 minutes - depending on the size of the housing - to perform on a 36 cores CPU AWS instance. We don't use GPU because it's not cost-effective on AWS.

### Shoebox Overview

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/shoebox-overview.png" alt="shoebox-overview-0"/>
</div>
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/shoebox-overview-1.png" alt="shoebox-overview-1"/>
</div>
<br />


### Shoebox view

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/shoebox-zoom-1.png" alt="shoebox-zoom-1"/>
</div>
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/shoebox-zoom-2.png" alt="shoebox-zoom-2"/>
</div>
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/shoebox-zoom-3.png" alt="shoebox-zoom-3"/>
</div>
<br />


### Alternatives of lot : original plan

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/2D-A.png" alt="plan-2d-A"/>
</div>
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/3D-A.png" alt="plan-3d-A"/>
</div>
<br />

### Alternatives of lot : alternative plan

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/2D-B.png" alt="plan-2d-B"/>
</div>
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/3D-B.png" alt="plan-3d-b"/>
</div>
<br />

We needed scalability but also a industrialization in such a way as to have a 100% automated and fast process.

We wanted to orchestrate the rendering of these hundreds of bakes in a simple, scalable, and reliable way. These processes needed to be started without the intervention of anyone from the tech team.

## Why we chose the argo workflow ?

At [Habx](https://www.habx.com), we have used [kubernetes](http://kubernetes.io/) for years, it has proven to be the perfect tool for highly available services. We also use docker for everything which helps us to simply package our versioned code.

After various internal studies, we fell in love with the workflow management on Kubernetes that's why we chose Argo Workflow a few weeks before it entered the [CNCF](https://www.cncf.io).
The predominant factor of our choice was its use of Directed Acyclic Graph (DAG) which allows doing complex things in terms of workflow.

## Workflow

Here are the different steps of the workflow we are using to generate these 3D views.

* **Enrichment**: Each layout is automatically enriched with some pieces of furniture and decorations to give a homely vibe to an otherwise pretty empty housing. It also defines the last finishes that shall be applied on the walls, floors, and some elements (like the kitchen countertop).

* **Conversion**: The layout which is mostly a 2D plan is converted to a 3D representation exported in the [GLTF format](https://fr.wikipedia.org/wiki/GlTF).

* **3D Validation**: The resulting GLTF is validated to make sure we're not starting a costly process on a broken 3D. It's done with a fail-fast strategy and this step provides a detailed report to help the operator who must correct the plan.

* **Bake**: We bake the housing scene with a program orchestrating [blender](https://www.blender.org). This costly process consumes pretty much all of the time of the workflow.

* **Compression**: Resulting images are compressed in various dimensions.

* **Upload**: The output GLTF 3D scene and the associated images are uploaded on an s3 bucket and become instantly available through a CDN.

The heavy steps like the bake are done on [spot instances](https://aws.amazon.com/ec2/spot/) to have a low cost, in case of unavailability we have an automatic failback via retry on-demand instances which are more expensive.

### How it starts and ends

We have a micro-service dedicated to tracking all the bakes we are producing. This service gives the order to generate all the bakes as part of one workflow.
The workflow contains various steps to notify the service of the current status of the bakes.

The project manager can start the processing of hundreds of 3D shoeboxes and then publish them with few clicks.

#### Start : UI to Argo

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/bake-start.png" alt="bake-start"/>
</div>
<br />

#### End : validation

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/validation.png" alt="plan-validation"/>
</div>
<br />

### Workflow concept

To keep both a cost-effective and efficient generation process, we use spot instances that fall back on on-demand instances in case of failures.

<br />
<div style="width: 100%; max-width: 500px; margin: 0 auto;">
<img src="./images/portfolio/ThreedAtHabx/bakes-schema-workflow.png" alt="bakes-schema-workflow"/>
</div>
<br />

### Argo Workflow

Here is our industrialization which is "infinitely" scalable.

<br />
<div style="width: calc(100% + 300px); margin: 0 -150px;">
<img src="./images/portfolio/ThreedAtHabx/argo-workflow-bakes.png" alt="argo-workflow-bakes"/>
</div>
<br />

We use template workflows to share the job code base between our workflows.

## Conclusion

Thanks to Argo 🙏, we built a quite complex processing workflow that can be controlled by our project managers.