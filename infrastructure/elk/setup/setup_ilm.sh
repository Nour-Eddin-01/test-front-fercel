#!/bin/sh

echo " Waiting for Elasticsearch..."
until curl -s http://elasticsearch:9200/_cluster/health | grep -q '\"status\":\"\(green\|yellow\)\"'; do
  sleep 5
done

echo " Pushing ILM Policy..."
curl -X PUT "http://elasticsearch:9200/_ilm/policy/tradehub_retention_policy" \
     -H 'Content-Type: application/json' \
     -d '{
  "policy": {
    "phases": {
      "hot": { "actions": { "rollover": { "max_age": "2d", "max_size": "50gb" } } },
      "delete": { "min_age": "7d", "actions": { "delete": {} } }
    }
  }
}'

echo " Linking all TradeHub logs with Strict Mapping and Single-Node settings..."
curl -X PUT "http://elasticsearch:9200/_template/tradehub_logs_template" \
     -H 'Content-Type: application/json' \
     -d '{
  "index_patterns": ["tradehub-*"], 
  "settings": {
    "index.lifecycle.name": "tradehub_retention_policy",
    "index.number_of_replicas": 0
  },
  "mappings": {
    "properties": {
      "level": { "type": "integer" },
      "status": { "type": "integer" },
      "request_time": { "type": "float" },
      "service": { "type": "keyword" },
      "tag": { "type": "keyword" },
      "container_name": { "type": "keyword" }
    }
  }
}'

echo " Priming Elasticsearch with initial seed log..."
curl -X POST "http://elasticsearch:9200/tradehub-logs-init/_doc/" \
     -H 'Content-Type: application/json' \
     -d "{\"@timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"service\": \"setup\", \"message\": \"System initialized by Overseer\", \"level\": 6}"




echo " Waiting for Kibana..."
until [ "$(curl -s -o /dev/null -w "%{http_code}" http://tradehub-kibana:5601/kibana/api/status)" -eq 200 ]; do
  sleep 5
done

echo " Creating Master Kibana Index Pattern..."
curl -f -X POST "http://tradehub-kibana:5601/kibana/api/saved_objects/index-pattern/tradehub-master-pattern" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: application/json" \
    -d '{
  "attributes": {
    "title": "tradehub-*",
    "timeFieldName": "@timestamp"
  }
}'

echo " Importing TradeHub Overseer Dashboard..."
curl -X POST "http://tradehub-kibana:5601/kibana/api/saved_objects/_import?overwrite=true" \
    -H "kbn-xsrf: true" \
    --form file=@/dashboard.ndjson

echo " Zero-Touch Automation Complete!"