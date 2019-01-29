ARG BASE_CONTAINER=jupyter/tensorflow-notebook:e8613d84128b
FROM $BASE_CONTAINER

USER root

# Installing Google Cloud SDK
# Copying contents from https://github.com/GoogleCloudPlatform/cloud-sdk-docker/blob/master/Dockerfile
ARG CLOUD_SDK_VERSION=231.0.0
ENV CLOUD_SDK_VERSION=$CLOUD_SDK_VERSION
RUN apt-get -qqy update && apt-get install -qqy \
        curl \
        gcc \
        python-dev \
        python-setuptools \
        apt-transport-https \
        lsb-release \
        openssh-client \
        git \
        gnupg \
    && easy_install -U pip && \
    pip install -U crcmod   && \
    export CLOUD_SDK_REPO="cloud-sdk-$(lsb_release -c -s)" && \
    echo "deb https://packages.cloud.google.com/apt $CLOUD_SDK_REPO main" > /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add - && \
    apt-get update && \
    apt-get install -y google-cloud-sdk=${CLOUD_SDK_VERSION}-0 \
        google-cloud-sdk-app-engine-python=${CLOUD_SDK_VERSION}-0 \
        google-cloud-sdk-app-engine-python-extras=${CLOUD_SDK_VERSION}-0 && \
#         google-cloud-sdk-app-engine-java=${CLOUD_SDK_VERSION}-0 \
#         google-cloud-sdk-app-engine-go=${CLOUD_SDK_VERSION}-0 \
#         google-cloud-sdk-datalab=${CLOUD_SDK_VERSION}-0 \
#         google-cloud-sdk-datastore-emulator=${CLOUD_SDK_VERSION}-0 \
#         google-cloud-sdk-pubsub-emulator=${CLOUD_SDK_VERSION}-0 \
#         google-cloud-sdk-bigtable-emulator=${CLOUD_SDK_VERSION}-0 \
#         google-cloud-sdk-cbt=${CLOUD_SDK_VERSION}-0 \
#         kubectl && \
    gcloud config set core/disable_usage_reporting true && \
    gcloud config set component_manager/disable_update_check true && \
    gcloud config set metrics/environment github_docker_image && \
    gcloud --version && \
    chown -R $NB_UID ~/.config/gcloud

USER $NB_UID

RUN pip install --upgrade \
                  awscli \
                  boto3 \
                  google-cloud-speech

EXPOSE 6006

# Execute the following commands within the base directory of the repository to build and run the environment
# docker build -t w210/capstone:1.0 .
# docker run --rm -p 8888:8888 -p 6006:6006 -e JUPYTER_ENABLE_LAB=yes -v "$PWD":/home/jovyan/work w210/capstone:1.0

# Interested in cleaning up your docker environment within your laptop? Check out these commands
# docker image ls
# docker image rm _____ <- insert IMAGE IDs that you want to remove
# docker ps -a
# docker rm _____ <- insert CONTAINER IDs that you want to remove

# Sources/References
# Jupyter Docker Stacks: https://jupyter-docker-stacks.readthedocs.io/en/latest/index.html
# jupyter/tensorflow-notebook info: https://jupyter-docker-stacks.readthedocs.io/en/latest/using/selecting.html
# Docker Hub image tags: https://hub.docker.com/r/jupyter/tensorflow-notebook/tags/