import urllib
import os 

for z in range(10,15):
    alpha=z-10
    for x in range(851*pow(2,alpha),855*pow(2,alpha)):
        for y in range(418*pow(2,alpha),422*pow(2,alpha)):
            srcPath="http://a.tile.openstreetmap.org/"+str(z)+"/"+str(x)+"/"+str(y)+".png"
            dstPath=str(z)+"/"+str(x)+"/"+str(y)+".png"
            if os.path.exists(dstPath):
                continue
            print dstPath
            if not os.path.exists(str(z)+"/"+str(x)):
                os.makedirs(str(z)+"/"+str(x))
            urllib.urlretrieve(srcPath,dstPath)