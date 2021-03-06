require 'pragmas'
require 'scripting'
Dir['./app/models/**/*.rb'].each{ |f| require f }

# TODO documentation
class Catalog

  attr_reader :catalog

  def initialize
    @catalog = { :codes => {  } }
  end

  def codes
    Pragma.pragmas_named_in(:code, self.class).collect{|each| self.send(each.method, self)}
  end

  def be_preview
    self.codes.each{|each| self.push_code_type (each) }
    self
  end

  def push_code_type (_code)
    code = { :description => _code.type_description }
    @catalog[:codes][_code.tag.to_sym] = code
    code
  end

  def be_preview_for (symbol)
    type = self.codes.select {|each| each.tag == symbol.to_sym}.first
    return self unless type
    code = self.push_code_type(type)
    codes = type.all.pluck(:code).to_a
    code[:codes] = codes
    self
  end

  def be_info_for (symbol)
    type = self.codes.select {|each| each.tag == symbol.to_sym}.first
    return self unless type
    code = self.push_code_type(type)
    codes = type.all.pluck(:code, :description).to_a
    codes = codes.collect{|each| {:code => each[0], :description => each[1]}}
    code[:codes] = codes
    self
  end

  def be_full_info_for (code_type, code_id)
    type = self.codes.select {|each| each.tag == code_type.to_sym}.first
    return self unless type
    code = self.push_code_type(type)
    codes = type.where(code: code_id)
    codes = DocumentForJSONCleaner.new.clean_documents_for_json(codes)
    code[:codes] = codes
    self
  end

  def update_db
    self.codes.each{|each| update_db_code(each) }
  end

  def update_db_code(clazz)
    pragmas = Pragma.pragmas_named_in(:parser, clazz)
    unless pragmas.empty?
      parser = pragmas.first.method.eonum_value(clazz)
      puts 'Updating DB for '+clazz.name+'...'
      time_start = Time.now
      parser.parse
      codes = parser.stream.to_codes
      puts  '   parsed '+ codes.size.to_s + ' ' + clazz.name + 's'
      puts '   persisting data...'
      #codes.each {|each| each.persist_dataset}
      clazz.collection.insert codes.collect{|each| each.as_document } unless codes.empty?
      puts "   updated in #{Time.now - time_start} seconds"
    end
  end

  def to_json
    @catalog
  end
end