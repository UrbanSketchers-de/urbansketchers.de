require 'csv'

class CitiesDataSource < Nanoc::DataSource
  identifier :cities_csv

  def items
    csv_path = @config[:csv_path] || 'data/cities.csv'
    full_path = File.join(@site_config.dir, csv_path)

    return [] unless File.exist?(full_path)

    CSV.read(full_path, headers: true, encoding: 'UTF-8').map do |row|
      new_item(
        '',
        {
          city: row['city'],
          facebook: row['facebook'],
          instagram: row['instagram'],
          whatsapp: row['whatsapp'],
          description: row['description']
        },
        "/#{slugify(row['city'])}"
      )
    end
  end

  private

  def slugify(text)
    text.downcase
        .gsub(/[äÄ]/, 'ae')
        .gsub(/[öÖ]/, 'oe')
        .gsub(/[üÜ]/, 'ue')
        .gsub(/ß/, 'ss')
        .gsub(/[^a-z0-9]+/, '-')
        .gsub(/^-|-$/, '')
  end
end
