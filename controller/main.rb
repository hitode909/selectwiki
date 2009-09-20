class MainController < Controller
  def index
    @words = Word.all
  end
end
