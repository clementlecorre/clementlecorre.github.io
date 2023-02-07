<br /><br/>

# How to automate dev tooling at Habx

## Introduction

Habxops is a bot that manages recurring "tasks" on Habx projects. 

It's based on:

🥊   [slack-go](https://github.com/slack-go/slack)</br>
🥊   [gin-gonic](github.com/gin-gonic/gin)

## Why Habxops

Due to the large number of tasks executed by developers daily, we need to simplify their launch process. Previously, we used a Jenkins form which was time-consuming and reduced development time on our applications. That's why we decided to create a slack bot to streamline the task launch process.

## Actions to automate



⭐️   Creating new releases with a changelog</br>
⭐️   Adding new PG extensions</br>
⭐️   Launching tests on a project or environment (dev, staging, prod)</br>
⭐️   Setting up PG rules on a database</br>
⭐️   Rolling back versions on a project</br>
⭐️   Restarting pod services</br>
⭐️   Deploying staging to production (with a confirmation) for a project</br>
⭐️   Checking the version of a project</br>
⭐️   Launching orbital processing (3D industry)</br>

## HabxOps + Argo Workflow

Argo Workflow is a container-native workflow engine for orchestrating parallel jobs on Kubernetes. It is designed to be a lightweight Kubernetes native solution for orchestrating parallel jobs. Argo Workflow is a CNCF incubating project.

## Architecture

<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/habxops-arch.drawio.png" alt="architecture"/>
</div>


### Creating a new release

To create a new release, you must be in the project's repository and type the following command:

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/re-actions-started.png"/>
</div> 
<br />


After less than one minute, the bot will mark your slack message. Your releases is finish.

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/re-actions-end.png"/>
</div> 
<br />

Argo workflow preview. Callback is used to update the slack message. (Emoji, text, etc.)

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/re-actions-workflow.png"/>
</div> 
<br />

Audit messages in slack. The bot will send you a message when the action is finished.

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/audit-messages.png"/>
</div> 
<br />

Argo workflow duration (less than 1 minute)

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/re-actions-duration.png"/>
</div> 
<br />

Python script exec somes actions : Jira fix version creation and links, Github Tag creation, Github Release create, Changelog génation

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/releases.png"/>
</div> 
<br />


Some number of "create releases" action across all repositories (~400) per month.

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/re-actions-count.png"/>
</div> 
<br />



### Other major automation actions

The 3D development teams do not know how to launch orbital processing. It is complex with many parameters to enter. Habxops allows orbital processing to be launched with a simple command. Jenkins has many parameters to enter, about 20. Habxops allows orbital processing to be launched with a simple command.


<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/orbital-action.png"/>
</div> 
<br />

+2000Jobs executed per workflows

<br />
<div style="width: 100%; max-width: 900px; margin: 0 auto;">
    <img src="./images/portfolio/habxopsAtHabx/orbital-workflows.gif"/>
</div> 
<br />