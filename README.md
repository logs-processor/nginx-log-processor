#Nginx Log Parser

A Node.js-based tool for parsing Nginx access logs and storing structured data in a PostgreSQL database.  
It supports batch processing, configurable startup behavior, and automatic log ingestion from a specified directory.

---

##Features

- **Batched log processing** for efficiency  
- **PostgreSQL integration** with connection pooling  
- **Automatic file tracking** each processed log file is tracked by name to prevent duplicate processing  
-  Option to **drain or skip logs before API start**  
- **Tokenized pagination** for efficient and stateless log retrieval through the API
- **Configurable** via simple `config.json`  
-  Lightweight and easy to deploy  

---

##Requirements

- **Node.js**
- **npm**
- **PostgreSQL**

---

##Installation and Launch

1. Clone the repository
2. Install dependencies 
    ```bash
    npm install
3. Review and set configuration located in **config.json** (by default DB schema will be created auto on 1st run)
5. Launch!
    ```bash
    npm run start


##API Endpoints

1. **Health check route (`/health`)** for future proof Dockerisation and readiness/liveness probes:
    ```bash
    http://localhost:3000/v1/health
    
Example response:
    ```
    {
        "payload": "ok"
    }
    ```
2. Cursor based logs fetching endpoint which returns logs sorted by: ip desc and route desc
To get first page of logs call GET:
    ```bash
    http://localhost:3000/v1/logs?batchSize=16
supported parameters batchSize - size of log entries per row
response example:
    ```bash
    {
        "payload": {
            "objects": [],
            "metadata": {
                "paginationToken": "Mjc3MzYzOTUsMjAwMTpkYjg6MDoxOjA6MDowOmUsL3p6enp0Zw==",
                "batchSize": 0
            }
        }
    }
    
    To get next page call GET: http://localhost:3000/v1/logs?batchSize=16&paginationToken=Mjc3MzYzOTUsMjAwMTpkYjg6MDoxOjA6MDowOmUsL3p6enp0Zw==