require 'test_helper'

class SuDAgeParserTest < ActiveSupport::TestCase

  def setup
    @parser = SuDAgeParser.new('./test/fixtures/su_d_age.xls')
  end

  def test_basic_test

  end
end