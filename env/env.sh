#!/bin/bash

export POSTGRES_HOST=localhost
export POSTGRES_USER=sharecode
export POSTGRES_PASSWORD=sharecode
export POSTGRES_DB=sharecode
export DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/sharecode

export RABBITMQ_HOST=localhost 
export RABBITMQ_DEFAULT_USER=sharecode
export RABBITMQ_DEFAULT_PASS=sharecode
export RABBITMQ_USER=${RABBITMQ_DEFAULT_USER}
export RABBITMQ_PASS=${RABBITMQ_DEFAULT_PASS}

export MONGO_INITDB_ROOT_USERNAME=sharecode
export MONGO_INITDB_ROOT_PASSWORD=sharecode

export JWT_KEY=a28afc6f-55b8-4546-83f1-2bf727e72539

export CLIENT_ID=clientid
export CLIENT_SECRET=clientsecret

export ADMIN_USER_ID=cf4eb825-647d-4397-96de-5bf02dbcfbc9