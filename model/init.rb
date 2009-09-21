require 'dm-core'
DataMapper.setup(:default, {
  :adapter  => 'sqlite3',
  :database => 'app.db'
})

require 'model/word'
require 'model/description'

#DataMapper.auto_migrate!
