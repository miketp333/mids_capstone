FROM jupyter/tensorflow-notebook:e8613d84128b

EXPOSE 6006

# Uncomment below to install additional packages that are not in source docker image
# RUN pip install gensim \
#                 nltk \
#                 graphviz

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