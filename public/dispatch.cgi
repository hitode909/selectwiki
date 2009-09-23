#!/usr/bin/env ruby

# Go to application directory.
Dir.chdir(File.dirname($0))
Dir.chdir("..")

require 'rubygems'
require 'ramaze'

Ramaze::Log.loggers = [ Ramaze::Logger::Informer.new("ramaze.log") ]
Ramaze::Global.adapter = :cgi

$0 = "start.rb"
load $0
