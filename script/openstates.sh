#!/bin/bash
# It is not recommended to use the MongoDB dump in production as it is not
# officially supported and maintained.

# Remove the previous dump.
rm -rf dump/
rm -rf latest-mongo-dump.tar.gz
# Get a fresh dump.
curl -O http://static.openstates.org.s3.amazonaws.com/mongo/latest-mongo-dump.tar.gz
tar xvf latest-mongo-dump.tar.gz
# Remove unnecessary collections.
rm -f dump/fiftystates/{billy_runs,document_ids,event_ids,manual.leg_ids,manual.name_matchers,popularity_counts,quality_exceptions,reports,tracked_versions,vote_ids}.bson
# Can add --noIndexRestore and use the `billy-util mongo-index --purge` command instead.
mongorestore -drop dump/
