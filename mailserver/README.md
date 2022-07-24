# Mailserver Setup Guide

## Installation

```bash
docker compose up -d
```

## Create first email account

```bash
bash setup.sh email add <email> <password>
```

## Configure DKIM
Run the following commands.

```bash
bash setup.sh config dkim
cat docker-data/dms/config/opendkim/keys/appchain.cloud/mail.txt
```

Print out the output and configure on DNS management portal.

## Other notes

- Remember to configure PTR and rDNS
- Remember to configure SPF
- Remember to configure DMARC
- Remember to verify domain with Google