#!/bin/bash
npm version $1 && \
grep version package.json | cut -f 4 -d '"' | xargs -I OutputFromGrep sed -Ei 's/(sonar.projectVersion=).*$/\1OutputFromGrep/g' sonar-project.properties && \
git add sonar-project.properties && \
git commit -m "Bump SonarCloud version to match package.json"
