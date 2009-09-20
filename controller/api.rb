module Api
  class WordsController < JsonController
    def index
      @words = Word.all
    end
  end

  class WordController < JsonController
    before_all do
      @word_name = url_decode request[:word]
      @word      = Word.find(:name => @word_name)
    end

    def index
    end

    def update
    end

    def delete
    end
  end
end


=begin
    def subscribe
      return unless request.post?
      return unless @uri.length
      uris = @uri.split(',')
      @group ||= Group.create(:name => @name)
      feeds = uris.map{|u| Feed.find_feeds(u.strip)}.flatten.compact
      feeds.each do |feed|
        begin
          @group.add_feed(feed)
        rescue
        else
          Activity.subscribe(@group, feed)
        end
      end
      @group.uniq_feeds
    end

    def unsubscribe
      return unless request.post?
      respond('The group not found', 404) unless @group
      respond('The feed not found', 404) unless @feed
      begin
        @group.remove_feed(@feed)
      rescue
      else
        Activity.unsubscribe(@group, @feed)
      end
      @group.uniq_feeds
    end
  end
=end
