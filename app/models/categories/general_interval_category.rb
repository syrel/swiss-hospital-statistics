require 'abstract/interval_category'

class GeneralIntervalCategory < IntervalCategory
  include Mongoid::Document
  include MultiLanguageText

  field :dad, :type => Integer
  field :sa, :type => Integer
  field :min, :type => Integer
  field :max, :type => Integer
  field :number, :type => Integer

  @id = :interval

end