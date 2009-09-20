class Description < Sequel::Model
  set_schema do
    primary_key :id
    String :body
    foreign_key :word_id
    time :created_at
    time :modified_at
  end
  many_to_one :word
  create_table unless table_exists?

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
