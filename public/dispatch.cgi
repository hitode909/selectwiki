#!/bin/sh
HOME=/home/hitode909
XLIB=$HOME/local/rubygems/lib/ruby
export GEM_HOME=$HOME/local/rubygems


# -*- coding: utf-8 -*-
exec ruby -S -Ku -x $0 "$@"
#!/usr/local/bin/ruby
# coding: utf-8
$KCODE = 'u'

AppDir = "#{ENV['HOME']}/co/selectwiki"
Dir.chdir AppDir

=begin
STDERR.reopen('log/error_out.log', 'a')
class <<Dir
  def tmpdir;
    "#{::AppDir}/tmp"
  end
end
=end

require 'rubygems'
require 'ramaze'

$ramaze_0 = "#{::AppDir}/start.rb"

alias $0 $ramaze_0
require $0

Ramaze.options.adapter.handler = :cgi

require 'ramaze/log/informer'
Ramaze::Log.loggers = [ Ramaze::Logger::Informer.new( "#{::AppDir}/log/ramaze.cgi.log" ) ]

=begin
require 'logger'
SessionLog = Logger.new('log/session.log')
SessionLog.level = Logger::ERROR
SessionDB = Sequel.connect('amalgalite://data/session.db', :logger => [SessionLog])
require 'ramaze/cache/sequel'
Ramaze::Cache::Sequel::Table.db = SessionDB

Innate::Cache.options.names = [:session, :user, :view]
Innate::Cache.options.session = Ramaze::Cache::Sequel
Innate::Cache.options.user = Ramaze::Cache::Sequel
Innate::Cache.options.view = Ramaze::Cache::Sequel
=end

Ramaze.start :mode => :live
