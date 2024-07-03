# Developer notes

To get a list of enabled rules for a given config, you can use a command like this:

```shell
# This command outputs enabled rules for the strict config to the rules.json file.
jq '.rules | to_entries | map(select(.value | tostring | contains("off") | not)) | from_entries' printed-configs/strict.json | jq 'keys' > rules.json
```
