# strangely facebook connect's js throws an error without this in test,
# but not in production
ENV["DISQUS_SHORTNAME"] ||= "dobot"
