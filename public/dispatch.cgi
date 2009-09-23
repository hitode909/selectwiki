#!/usr/bin/env ruby

# Go to application directory.
Dir.chdir(File.dirname($0))
Dir.chdir("..")

require 'rubygems'
require 'ramaze'
require 'ramaze/log/informer'


Ramaze.options.adapter.handler = :cgi
Ramaze::Log.loggers = [ Ramaze::Logger::Informer.new( "ramaze.cgi.log" ) ]
$0 = "start.rb"
load $0
