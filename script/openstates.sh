#!/bin/bash
# Remove the previous dump.
rm -rf dump/
rm -rf latest-mongo-dump.tar.gz
curl -O http://static.openstates.org.s3.amazonaws.com/mongo/latest-mongo-dump.tar.gz
tar xvf latest-mongo-dump.tar.gz
# Remove unnecessary collections.
rm -f dump/fiftystates/{billy_runs,document_ids,event_ids,manual.leg_ids,manual.name_matchers,popularity_counts,quality_exceptions,reports,tracked_versions,vote_ids}.bson
mongorestore -drop dump/
