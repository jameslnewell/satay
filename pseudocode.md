```
"scripts/xyz.js" => "project/branch/xyz.js"

source = "scripts/"
prefix = "project/branch/"
name = "xyz.js"

destination path = "project/branch/xyz.js"
```

```js
function listLocalFiles(groups) {
  groups.map(group => {
    mapA = disk.list(group.source, {group.include, group.exclude})
    mapA = prefixMap(mapA, group.prefix)
    mapA = paramsMap(mapA, group.params)
  })
}

function listRemoteFiles(groups) {
  groups.map(group => {
    mapB = bucket.list(group.source, {group.include, group.exclude})
    mapB = prefixMap(mapB, group.prefix)
  })
}
```
