# Be sure to restart your server when you modify this file.

# Your secret key for verifying the integrity of signed cookies.
# If you change this key, all old signed cookies will become invalid!
# Make sure the secret is at least 30 characters and all random,
# no regular words or you'll be exposed to dictionary attacks.
OpenGovernment::Application.config.secret_token = ENV['SECRET_TOKEN'] || '996fb248e768fa841bbbb687951717a0e71d07d7446a3ed4deda69af1a5b1df67af9ac62746cca2ec0e9304ed6c21c707198c739755267a3710cc69a416d067a'
