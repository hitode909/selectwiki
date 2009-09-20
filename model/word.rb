class Word < Sequel::Model
  set_schema do
    primary_key :id
    String :name, :unique => true, :null => false
    time :created_at
    time :modified_at
  end
  one_to_many  :descriptions
  create_table unless table_exists?

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
    desc = Description.create(:body => body)
    self.add_description(desc)
  end

  def delete(id)
    desc = Description.find(:id => id)
    return unless desc
    self.remove_description(desc)
    desc.destroy
  end
end
