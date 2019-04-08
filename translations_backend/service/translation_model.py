import pandas as pd
import numpy as np
from numpy.linalg import norm
from fastdtw import fastdtw, dtw
import librosa
import sklearn
# import librosa.display
# import numpy as np
# import scipy.io.wavfile
# import os
# from scipy.fftpack import dct
# import matplotlib
# matplotlib.use('PS')
# from matplotlib import pyplot as plt
# from PIL import Image

def test():
	return "This is a test2."

def generate_mfcc_lists(train_aud, test_aud, number_mfcc=20):
    aud = { 'train_aud': train_aud, 'test_aud': test_aud}
    for key in aud.keys():
        files = aud[key]
        # initialize general variables
        mfcc = []
        trim_len = []
        pretrim_len = []

        # conduct loop over set of audio files
        for file in files:
            data, rate = librosa.load(file)

            # Trim leading and trailing silence
            pretrim_len.append(round(librosa.get_duration(data, rate),1))
            data, index = librosa.effects.trim(data, top_db=15)
            trim_len.append(round(librosa.get_duration(data, rate),1))

            mfcc.append(librosa.feature.mfcc(data, rate, n_mfcc=number_mfcc))

        # Scale features
        for i,x in enumerate(mfcc): 
            mfcc[i] = sklearn.preprocessing.scale(mfcc[i], axis=1)

        # assign result to corresponding variables
        if (key == 'train_aud'):
            x_train = mfcc
            train_len = trim_len
        elif (key == 'test_aud'):
            x_test = mfcc
            test_len = trim_len
    
    return x_train, x_test, train_len, test_len

def calc_dtw(x_train, x_test, train_len, test_len, radius=1, total_shifts = 7):
    """
    Calculates the DTW distance between the test cases and the training data
    after applying a series of time shifts to the test data
    
    Returns an array of the DTW dist of each shifted MFCC against the training
    prompt, and prints out the time taken to run the calculation"""
    
    master_dist = []
    for i,x in enumerate(x_test):
        mfcc_dist = []
        # Default: For 7 total vectors - 3 shifts left, no shift, and 3 shifts right @ 15% range
        max_shift = x.shape[1]*0.15   # Indicate % range here
        # Total shifts will always be an odd number so there is the same number of shifts in each direction
        total_shifts = total_shifts + 1 if total_shifts % 2 == 0 else total_shifts
        shift = int(max_shift/int(total_shifts/2))
        for d in range(shift * int(total_shifts/2) * -1, shift * int(total_shifts/2) + 1, shift):
            dist = []
            for i2,x2 in enumerate(x_train):
                len_threshold = max(train_len[i2]*0.3, 5)
                min_thres = train_len[i2] - len_threshold
                max_thres = train_len[i2] + len_threshold

                # Run DTW dist if stored phrase is within -/+ 30% seconds as requested test phrase
                if min_thres <= test_len[i] <= max_thres:
                    distance, path = fastdtw(np.roll(x,d).T, x2.T, radius=radius, dist=lambda x, y: norm(x - y))
                # else assume they are not the same by assuming a very large distance
                else:
                    distance = 1000000

                dist.append(distance)

            mfcc_dist.append(dist)
        master_dist.append(mfcc_dist)
        
    #print('MFCCs:{0}, Radius:{1}, Time:{2:.2f} sec'.format(x_train[0].shape[0], radius))
    
    return master_dist


def prediction(master_dist, y_train, test_len):
    
    """
    Given an array of DTW distances and the correct labels associated with the test case
    check what the predicted label would be for each shifted MFCC vector by recording
    the minimum DTW distance between the test and training examples
    The overall prediction is then the minimum DTW distance across the entire array of
    shifted vectors
    
    Return a table showing the correct label, the overall prediction, and the intermediate
    predictions for each shift of the test MFCC"""
    
    prediction_overalldist = []
    dtw_distance = []
    votes = []

    # Loop through each training example
    for i,x in enumerate(master_dist):
        vote = []
        # For each of the shifted vectors, get the prediction with min distance - the votes
        min_dist = 1000000
        for i2,x2 in enumerate(x):
            vote.append(x2.index(min(x2)))

            # Save the overall min distance from all shifted vectors = overall closest prediction
            if min(x2) < min_dist:
                min_dist = min(x2)
                min_overall = x2.index(min(x2))

        # Overall closest prediction out of the shifted MFCC vectors - the final vote
        prediction_overalldist.append(min_overall)
        dtw_distance.append(min_dist)

        # Track votes - determine if some vectors perform worse
        votes.append(vote)
    
    num_correct_overall = 0

    predicted_phrase = [y_train[i] for i in prediction_overalldist]
    
    pred_tuples = list(zip(prediction_overalldist, predicted_phrase, votes, dtw_distance, test_len))
    pred_df = pd.DataFrame(pred_tuples, columns=['Prediction','Predicted Phrase','MFCC Predictions','DTW Distance','Test Len'])
    
    # Assume a phrase is not stored in system if DTW Distance / Test Len ratio is greater than 165
    # 160 should be used where radius = 1. This cutoff was determined testing 23 dysarthric phrases
    pred_df['DTW Ratio'] = pred_df['DTW Distance'] / pred_df['Test Len']
    pred_df['Unknown Phrase'] = pred_df['DTW Ratio'] > 165.0

    # pred_df_filter = pred_df[pred_df['Unknown Phrase'] == False]
    
    return pred_df['Predicted Phrase'].values.tolist()