# README

# BelayChain Technical Documentation
Created by: Kat Leight

BelayChain is a full stack application that stores rock climbing gym belay certifications on a blockchain. 
 

## SUMMARY
This app securly stores rock climbing gym belay certifications on a blockchain so that gyms and members can access their belay certifications anywhere, anytime, eliminating the need for ANOTHER belay test when a member walks into a new gym. 

APP FEATURES

This app allows a gym or a member to login with an email and password.  
This app allows an administrator to login with a username and password.
A new gym can create an account (username must be unique and password must be between 6 and 12 characters).  
A gym, member, or administrator can edit their account information.  
A gym can view and search all of their recorded belay certifications.  
A gym can add a new belay certification.  
When the first certification for a member is created, an account is also created for that member with their associated email and the password: "Checkyourkn0t".  
A gym can post a revoked certification.  
A member can view all of their recorded belay certifications.  
A gym or a member can click on a certification to get a QR code for that certification.  
Anyone can scan the QR code (or click the button on the page) to verify and view the certification.       
A member or administrator can delete their account (gyms must contact an admin to have their associated certifications reassigned first).  

## API
The users API for this app is set up in Ruby on Rails connected to postgreSQL.  
The blockchain API for this app is set up as a Node.js/Express API connected to mongoDB to store blocks. 

## RESPSONSIVE STYLING

This app is responsively styled to work on desktop and mobile devices.  

## BACKGROUND INFORMATION
BELAY CERTIFICATION

In order to climb on ropes at a climbing gym, a member must take a belay certification to ensure that they have all of the necessary skills to belay safely. Because certifications are not currently shared between gyms, any time a member goes to a new gym for the first time, they must re-take the belay test.   
  
There are two types of belay certifications: Top Rope and Lead. A top rope certification means that a member can safely belay another climber on a top rope set up, meaning the rope is already run through an anchor at the top of the climb. A lead certification means that a member can safely belay another climber who is lead climbing, meaning the climber is bringing the rope up with them from the ground as they progress, clipping to quickdraws to protect a fall along the way. 

Lead climbing is considered more dangerous than top rope climbing, and belayers must be able to comfortably catch a lead fall in order to be certified. 

VERIFYING A CERTIFICATION

When verifying a certification, the blockchain will check for the hash it is given, but then also check the rest of the chain to see if there is a block that has a matching member and gym id, but with a "revoked certification." This way, if a member has had their belay certification revoked, it will display instead of the original certification. If someone has tampered with the certification and the hash is not found, it will return a message of "Cannot Verify Certification." 

BLOCKCHAIN

In this blockchain, each block contains a timestamp of when it was created, an index to reference it's position in the chain, a data object that contains the member id, gym id, and certification type for each certificaiton added, the hash of the previous block in the chain, a hash of the current block, and a nonce for mining. 

Each block is stored as document on a mongoDB cluster. In this sense, the blockchain is not truly decentralized as it is relaying on this database to persist the information instead of a distributed ledger. 

However, the blockchain was created to run on more than one node. Each node connects to its own mongo database, so that there are multiple copies of the chain, creating decentralization. 

When the server runs, it grabs all of the blocks stored on mongoDB and creates and array that is then stored as the chain in the blockchain class constructed on the local server. The server then operates on this local blockchain class. Whenever a block is added, it is added locally and a copy also pushed up to mongo.

Searching and verification take place on the local blockchain, not mongoDB. 

NODE COMMUNICATION

The blockchain is set up so that a new node may be added via it's URL and set to communicate with the network of existing nodes. Any time a block is added to the blockchain, the blockchain broadcasts the new node out to its network so that all nodes have the same chain of blocks. If for some reason a server is disconnected, an administrator can run a concenus so that it's blockchain will be updated with the longest existing copy of the chain.  

ADMINISTRATIVE ACCESS

This app was built with an administrator role that can log on and check the status of the current bockchain and any connected nodes. It can also run a concensus so if any node server was down and did not receive updated certifications, it will be brought up to date. Finally, the administrator can connect a new node by submiting the node URL. 
 

## TECHNOLOGY
This app was created using Node.js, Express, Mongoose, MongoDB Bcrypt, JWT, Ruby on Rails, postgresQL, React, React Router, Redux, Javascript, HTML, and CSS. 


## DEMONSTRATION
A demostration of the app can be viewed here: 