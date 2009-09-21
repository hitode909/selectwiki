class Description
  include DataMapper::Resource
  property :id,          Serial, :serial => true
  property :body,        String                  # unique
  property :created_at,  DateTime
  property :modified_at, DateTime

  belongs_to :word, :model => 'Word'
  #create_table unless table_exists?

  def before_create
    self.created_at = Time.now
  end

  def before_save
    self.modified_at = Time.now
  end

  def to_hash
    { :body => self.body,
      :id   => self.id
    }
  end
end
