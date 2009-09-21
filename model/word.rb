class Word
  include DataMapper::Resource
  property :id,          Serial, :serial => true
  property :name,        String, :key    => true, :nullable => false # unique
  property :created_at,  DateTime
  property :modified_at, DateTime

  has n, :descriptions, :model => 'Description'
  #create_table unless table_exists?

  def before_create
    self.created_at = Time.now
  end

  def before_save
    self.modified_at = Time.now
  end

  def to_hash
    { :name => self.name,
      :descriptions => self.descriptions.map(&:to_hash)
    }
  end

  def add(body)
    return unless body
    transaction do |txn|
      desc = self.descriptions.new(:body => body)
      desc.save
    end
  end

  def delete(id)
    desc = Description.first(:id => id, :word_id => self.id)
    return unless desc
    desc.destroy
  end
end
