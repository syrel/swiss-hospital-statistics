class Adrg
  include Mongoid::Document
  include MultiLanguageText

  belongs_to :mdc
  has_many :drgs

  field :code, :type => String
  field :text_de, :type => String
  field :text_fr, :type => String
  field :text_it, :type => String

end