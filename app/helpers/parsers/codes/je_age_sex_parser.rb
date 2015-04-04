require 'parsers/abstract/composite_parser'
require 'parsers/streams/je_age_sex_stream'
require 'datasets/age_sex_dataset'

class JeAgeSexParser

  @@interval_column = 1
  @@code_column = 2
  @@percentage_column = 3
  @@dad_column = 4

  def initialize(file)
    @sheet = Roo::Excel.new(file)
    @sheet.default_sheet = @sheet.sheets.first
    @first_row = 8
    @last_row = 91
  end

  def stream
    JeAgeSexStream.new(@datasets)
  end

  def parse
    @datasets = []
    @sheet.sheets.each_with_index { |sheet, index|
       @sheet.default_sheet = sheet

       @year = sheet[0..3].to_i
      # set the gender of the results, 0 = women, 1 = men, 2 = total
      if index % 3 == 0
        # total sheet
        @gender = 2
      elsif index % 3 == 1
         @gender = 1
      elsif index % 3 == 2
        @gender = 0
      end

      (@first_row .. @last_row).each do |row_index|
        # the second column always contains a value
        if @sheet.cell(row_index, @@code_column).nil?
          next
        end
        dataset = parse_row(row_index)
        unless dataset.nil?
          @datasets.push(dataset)
        end
      end
    }

    @datasets
  end

  private

  def parse_row(row)
    if (update_hospital_type(row))
      return
    end
    set_interval(row)

    dataset = AgeSexDataset.new
    dataset.year = @year
    data = dataset.new_data

    category = SexIntervalCategory.new
    category.hospital_type = @hospital_type
    category.sex = @gender
    category.percentage = @sheet.cell(row, @@percentage_column)
    category.dad = @sheet.cell(row, @@dad_column)

    category.interval = @interval

    data.add(category)

    dataset.code = @sheet.cell(row, @@code_column).split.first

    dataset
  end

  def set_interval(row)
    # new interval
    unless @sheet.cell(row, @@interval_column).nil?
      str = @sheet.cell(row, @@interval_column)
      @interval = Interval.new.from_s(@sheet.cell(row, @@interval_column))
    end
  end

  def update_hospital_type(row)
    # hospital type
    unless @sheet.cell(row, @@code_column) =~ /\d/
      if @year == 1998
        return handle_special_1998_case(row)
      end

      @hospital_type = HospitalType.where(:text_de => @sheet.cell(row, @@code_column)).first
      return true
    end
    false
  end

  def handle_special_1998_case(row)
    # in 1998 the statistics structure was different
    mappings = {8 => "Allgemeine Krankenhäuser, Zentrumsversorgung", 25 => "Spezialkliniken: Psychiatrische Kliniken",
    42 => "Spezialkliniken: Rehabilitationskliniken"}
    @hospital_type = HospitalType.where(:text_de => mappings[row]).first
    return true
  end

 end