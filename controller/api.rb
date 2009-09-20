module Api
  class WordsController < JsonController
    def index
      { :words => Word.all.map(&:to_hash)
      }
    end
  end

  class WordController < JsonController
    before_all do
      @word_name = url_decode request[:word]
      @word      = Word.find(:name => @word_name)
      @description_body = url_decode request[:description]
      @description = Description.find(:id => request[:id])
      @error = []
    end

    def index
      respond('The word not found', 404) unless @word
      { :word => @word.to_hash}
    end

    def add
      return unless @description_body.length > 0
      @word = Word.create(:name => @word_name) unless @word

      begin
        if @description
          @description.body = @description_body
          @description.save
        else
          @word.add @description_body
        end
      rescue => e
        @error.push e
      end
      { :word  => @word.to_hash,
        :error => @error.map(&:message),
      }
    end

    def delete
      { :word => @word.to_hash}
    end
  end
end
