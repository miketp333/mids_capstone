### A Voice for All: Deep Learning Communication Assistant for People with Dysarthric Speech

##### Simon Hodgkinson, Michael Powers, Rich Ung

[Link to Planning Google Doc](https://docs.google.com/document/d/1TVl2XQT2vtzYGe07BVmdoNZk0fiAlElBSvRJIO_-4u4/edit#)

The TORGO data is downloaded and unzipped to data/TORGO. This folder contains 8 folders, one for each person ("F01", "F03", etc.) - 3 females and 5 males. It will not appear in the Github repo because it is added to the .gitignore file. It is too large to add to Github.

## Loading Environment

Run the following command within the base directory of this repository to **build** the notebook Docker environment for this project:
```
docker build -t w210/capstone:1.0 .
```

Run the following command within the base directory of this repository to **run** the notebook Docker environment for this project:
```
docker run --rm -p 8888:8888 -p 6006:6006 -e JUPYTER_ENABLE_LAB=yes -v "$PWD":/home/jovyan/work w210/capstone:1.0
```
