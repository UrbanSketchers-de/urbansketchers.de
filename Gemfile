# frozen_string_literal: true

source 'https://rubygems.org'

git_source(:github) { |repo_name| "https://github.com/#{repo_name}" }

group 'nanoc' do
  gem 'nanoc'
  gem 'nanoc-live'
  gem 'webrick', '~> 1.7'  # Ruby 3.x doesn't ship with WEBrick anymore
end

gem 'dotenv', '~> 2'

# Markdown & Typography
gem 'redcarpet', '>3.0'
gem 'rouge' # syntax highlighting
gem 'typogruby' # Fallback when Redcarpet is not available

# CSV support (required from Ruby 3.4+)
gem 'csv'

# needed for tasks
gem 'rake'
gem 'terminal-notifier'

# needed to run nanoc deploy
gem 'systemu'

# needed to run validations
gem 'w3c_validators'
gem 'nokogiri', '>= 1.13.3'

# XML Sitemap
gem 'builder'

# build tools
gem 'rubocop', '~> 1.26', require: false
