##  Setting up GPU instance of Google Cloud Platform

Retraining DeepSpeech with the TORGO data is computationally intensive - on an i7 CPU, it was taking about 2 days per epoch. Part of the issue is that the original model was trained with 2048 hidden nodes, so it is very large. Even if you decide to start from scratch rather than fine-tuning or freezing layers, and train using a much smaller number of hidden nodes, you will probably still want to use a GPU.

#### Set up a fresh instance in GCP

- 4 CPU / 15MB
- 1 GPU Tesla P100
- 50GB Persistent disc
- HTTP and HTTPS enabled

In management, paste in startup script. I was using DeepSpeech 10.4.1, and found that it required CUDA 9.

```#!/bin/bash```  
```echo "Checking for CUDA and installing." ```  
```# Check for CUDA and try to install.```  
```if ! dpkg-query -W cuda-9-0; then```  
```  # The 16.04 installer works with 16.10. ```  
```  curl -O http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/cuda-repo-ubuntu1604_9.0.176-1_amd64.deb```  
```  dpkg -i ./cuda-repo-ubuntu1604_9.0.176-1_amd64.deb  ```  
```  apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1604/x86_64/7fa2af80.pub  ```  
 ``` apt-get update ```  
 ``` apt-get install cuda-9-0 -y  ```  
```fi ```  
```# Enable persistence mode  ```  
```nvidia-smi -pm 1```  

Start instance on Google Cloud  
Open terminal on local machine, and run ```gcloud init ```  
Log in and select project  
On local machine run ```gcloud compute ssh --ssh-flag="-L 8896:127.0.0.1:8896" --ssh-flag="-L 6006:127.0.0.1:6006" <user>@<instance>```  
to allow connection via Jupyter notebook on port 8896 and Tensorboard on port 6006  

Check that startup script ran using  
```sudo google_metadata_script_runner --script-type startup --debug```  
Check that GPU driver was downloaded and installed using ```nvidia-smi```  


#### Get the correct versions of CUDA and cuDNN

Sign up for a developer account with nvidia if you don't already have one.  
Download cuDNN from <https://developer.nvidia.com/rdp/cudnn-download>. Select the matching CUDA version from the startup script (so in this case, CUDA 9) and CUDA DNN Library for Linux

If you did this on your local machine, then assuming the downloaded file is on the desktop, open a terminal on the local machine, and add the file to the cloud instance using

```gcloud compute scp ./Desktop/cudnn-10.0-linux-x64-v7.5.0.56.tgz <user>@<instance>:~/```

once it is there (check with ls) then unzip the .tar file with

```tar -xzvf cudnn-10.0-linux-x64-v7.5.0.56.tgz```

This unpacks several files, which you then need to move to a directory, using

```sudo cp cuda/include/cudnn.h /usr/local/cuda/include```  
```sudo cp cuda/lib64/libcudnn* /usr/local/cuda/lib64```  
```sudo chmod a+r /usr/local/cuda/include/cudnn.h /usr/local/cuda/lib64/libcudnn*```  

(need to use sudo or permission to move the file will be denied)

#### Download python packages and SoX (to help manipulate audio)

```sudo apt-get install ipython```  
```sudo apt-get install python3-pip```  
```sudo pip3 install numpy scipy matplotlib jupyter pandas```    
```sudo apt-get install sox libsox-fmt-mp3```  


#### Update path to CUDA files

```nano ~/.bashrc```

add the following 2 lines

```export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:/usr/local/cuda/lib64:/usr/local/cuda/extras/CUPTI/lib64"```  
```export CUDA_HOME=/usr/local/cuda```

save using CTRL+O, exit using CTRL+X, hit enter to save using the same filename and hit CTRL+X again

run ```source ~/.bashrc```

#### Install tensorflow

```pip3 install 'tensorflow-gpu==1.13.1'```

To check that TF is using your GPU, you can run a simple test:

launch python3, and then in python

```import tensorflow as tf```  
```with tf.device('/cpu:0'):```  
    ```a_c = tf.constant([1.0, 2.0, 3.0, 4.0, 5.0, 6.0], shape=[2, 3], name='a-cpu')```  
    ```b_c = tf.constant([1.0, 2.0, 3.0, 4.0, 5.0, 6.0], shape=[3, 2], name='b-cpu')```  
    ```c_c = tf.matmul(a_c, b_c, name='c-cpu')```  
```with tf.device('/gpu:0'):```  
    ```a_g = tf.constant([1.0, 2.0, 3.0, 4.0, 5.0, 6.0], shape=[2, 3], name='a-gpu')```  
    ```b_g = tf.constant([1.0, 2.0, 3.0, 4.0, 5.0, 6.0], shape=[3, 2], name='b-gpu')```  
    ```c_g = tf.matmul(a_g, b_g, name='c-gpu')```  
```with tf.Session(config=tf.ConfigProto(log_device_placement=True)) as sess:```  
    ```print (sess.run(c_c))```  
    ```print (sess.run(c_g))```  

if it prints out two matrices, one for each session, the GPU is working

Now for DeepSpeech!

## Install and run DeepSpeech

#### 1) Get Large File Storage for git

Download Linux AMD64 package from <https://github.com/git-lfs/git-lfs/releases/tag/v2.7.1>

Upload to GCP

Local machine:

```gcloud compute scp ./Desktop/git-lfs-linux-amd64-v2.7.1.tar.gz <user>@<instance>:~/```

GCP:

```tar -xzvf git-lfs-linux-amd64-v2.7.1.tar.gz```

Then ```sudo ./install.sh```

#### 2) Clone DeepSpeech repo and get models

```git clone https://github.com/mozilla/DeepSpeech```  
```cd DeepSpeech```  
```git install lfs```  
```wget https://github.com/mozilla/DeepSpeech/releases/download/v0.4.1/deepspeech-0.4.1-models.tar.gz```  
```tar xvfz deepspeech-0.4.1-models.tar.gz```  

#### 3) Install GPU version

```pip3 install deepspeech-gpu```


#### 4) Upload test audio file and test translation

```gcloud compute scp ./Desktop/<filename>.wav <user>@<instance>:~/DeepSpeech/audio```

To translate the file;

```deepspeech --model models/output_graph.pbmm --alphabet models/alphabet.txt --lm models/lm.binary --trie models/trie --audio ./audio/<filename>.wav```

Troubleshooting:

a) Will probably fail if running the wrong version of CUDA. Can check with ```git clone https://github.com/phohenecker/switch-cuda.git```, then ``cd switch-cuda`` and ```source switch-cuda.sh```. If you have multiple versions of CUDA, change to the desired one by running eg ```source switch-cuda.sh 9``` to switch to 9.

b) An error along the lines of  
_"/usr/lib/python3.5/wave.py", line 260, in _read_fmt_chunk  
raise Error('unknown format: %r' % (wFormatTag,))  
wave.Error: unknown format: 3 _  
indicates that either the chunk_id is missing from the wav file (see section 5 below for solution)

c) An error _"frame length (706) is greater than FFT size (512)"_ indicates that the sample rate is 22050 rather than 16000. Files have to be uncompressed and sampled at 16000 Hz for DeepSpeech to run. Unfortunately neither librosa.resample no scipy.io.wavfile.write fixed the problem. Not sure whether audacity or sox might help

#### 5) Upload TORGO data

Raw wav files from TORGO database won't work - certain wav files are missing their chunk_id and therefore can't be processed using scipy.wavfile, which is coded into DeepSpeech. The problem can be fixed by first loading the wav files using librosa and then saving them again - there is a script in Transfer_learning_with_DeepSpeech.ipynb that does this.

Certain other files are too short, and appear to be abandoned recordings. These won't match the transcript, and can be filtered out by removing references to any file where the size is less than 17000. Other files are extremely long and do not match the transcript (eg F03/Session1/wav_headMic/0118.wav and M01/Session2_3/wav_headMic/0276.wav). Excluding these two files significantly improves the loss profile when training. Again, there is a script in the workbook mentioned above to do this.


Make directories

```mkdir audio``` (put TORGO folder containing wav files here)  
```mkdir fine_tuning_checkpoints```  
```mkdir data/TORGO``` (for the csv files)  
```mkdir tensorboard_summaries```  
```mkdir models/tuned_model```  

Assuming TORGO files are on your local desktop, transfer them to GCP using ```gcloud compute scp --recurse ./Desktop/TORGO <user>@<instance>:~/DeepSpeech/audio```

DeepSpeech requires csv files in a fixed format to provide paths to where the training, dev and test wav files are stored. Use the notebook to generate these files if you want, and then upload them to ```<user>@<instance>:~/DeepSpeech/data/TORGO```

#### 6) Get DeepSpeech ready for training

```cd DeepSpeech```

```sudo apt-get install build-essential libssl-dev libffi-dev python-dev```  (need python-dev and the others to build wheels for next part, particularly cryptography)  

```pip3 install -r requirements.txt```  
```pip3 install $(python3 util/taskcluster.py --decoder)```  

#### 7) Try retraining

*** Can test things out first with three small files, say with 10 rows each ***

```python3 DeepSpeech.py --n_hidden 2048 --checkpoint_dir ./fine_tuning_checkpoints --epoch -3 --train_files ./data/TORGO/small_train.csv --dev_files ./data/TORGO/small_dev.csv --test_files ./data/TORGO/small_test.csv --learning_rate 0.0001 --summary_dir ./tensorboard_summaries --export_dir ./models/tuned_model```

If that works, you should have all the correct packages installed. Otherwise double check the requirements file, try the readme or FAQ on the DeepSpeech repo, or there is useful forum here <https://discourse.mozilla.org/c/deep-speech>

To use pre-trained model and run for three additional epochs, use the command

```python3 DeepSpeech.py --n_hidden 2048 --checkpoint_dir ./fine_tuning_checkpoints --epoch -3 --train_files ./data/TORGO/TORGO_train.csv --dev_files ./data/TORGO/TORGO_dev.csv --test_files ./data/TORGO/TORGO_test.csv --learning_rate 0.0001 --summary_dir ./tensorboard_summaries --export_dir ./models/tuned_model```

this will default to batch size 1, so it is slow. To run batches, add something like

```--train_batch_size 40 --dev_batch_size 20 --test_batch_size 20```

You can't change the number of hidden nodes, unless you train from scratch. You have to keep the same because we're continuing the training.

To monitor progress, launch TensorBoard using a remote terminal and ```tensorboard --logdir=./tensorboard_summaries --port=6006```
and then in local browser, go to http://127.0.0.1:6006.

(similarly if you want to manipulate files or explore data with a notebook, in a remote terminal just use ```jupyter notebook --port 8896```)

Using the above command, each training run will pick up from the last checkpoint. To stop this and begin fresh, add ```--load init```. Also, you can change relu clipping with eg ```--relu_clip 10```, or increase dropout with ```--dropout_rate 0.3```. Other commands and defaults are listed in the help file (```./DeepSpeech.py --helpfull```)
