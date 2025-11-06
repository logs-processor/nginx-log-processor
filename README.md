# Nginx Log API
**Console logs is left with intense to show how activity is going as it is a test task. Overall this should be converted to winston logger or simmilar**

A Node.js-based tool for parsing Nginx access logs and storing structured data in a PostgreSQL database.  
It supports batch processing, configurable startup behavior, and automatic log ingestion from a specified directory.

---

## Features

- **Batched log processing** for efficiency  
- **PostgreSQL integration** with connection pooling  
- **Automatic file tracking** each processed log file is tracked by name to prevent duplicate processing  
-  Option to **drain or skip logs before API start**  
- **Tokenized pagination** for efficient and stateless log retrieval through the API
- **Configurable** via simple `config.json`  
-  Lightweight and easy to deploy 

---

## Requirements

- **Node.js**
- **npm**
- **PostgreSQL**

---

## Installation and Launch

1. Clone the repository
2. Install dependencies 
    ```bash
    npm install
3. Review and set configuration located in **config.json** (by default DB schema will be created auto on 1st run)
4. Set processed **batch_size** at a time in **config.json**, depending on the lines amount, recommended not less than 500.
5. Launch!
    ```bash
    npm run start


## API Endpoints

1. **Health check route (`/health`)** for future proof Dockerisation and readiness/liveness probes:
    ```http://localhost:3000/v1/health```

    Example response:
    ```
    {
        "payload": "ok"
    }
    ```
2. Cursor based paginated logs fetch endpoint which returns logs sorted by: ip desc and route desc
To get first page of logs call GET with required parameter **batchSize** to set page size:
    ``` 
    http://localhost:3000/v1/logs?batchSize=1
    ```
    Response example:
    ```
    {
        "payload": {
            "objects": [
                {
                    "id": "180802",
                    "ip": "2001:db8:0:1:0:0:0:e",
                    "method": "PUT",
                    "route": "/zzmvqemwij",
                    "status": 204,
                    "bytes": 5133,
                    "timestamp": "2025-10-30T12:10:36.000Z",
                    "referrer": "https://www.msn.com/",
                    "user_agent": "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko",
                    "raw_line": "2001:db8:0:1:0:0:0:e - - [30/Oct/2025:16:10:36 +0200] \"PUT /zzmvqemwij HTTP/1.1\" 204 5133 \"https://www.msn.com/\" \"Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko\""
                }
            ],
            "metadata": {
                "paginationToken": "MTgwODAyLDIwMDE6ZGI4OjA6MTowOjA6MDplLC96em12cWVtd2lq",
                "batchSize": 1
            }
        }
    }
    ```
    To get next page of logs call GET with optional parameter **paginationToken** which will be returned in the response 
    metadata while next page could be fetched:
    ```
    http://localhost:3000/v1/logs?batchSize=1&paginationToken=MTgwODAyLDIwMDE6ZGI4OjA6MTowOjA6MDplLC96em12cWVtd2lq
    ```