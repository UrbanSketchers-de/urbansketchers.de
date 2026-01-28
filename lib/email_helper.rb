module EmailHelper
  def encode_email(email)
    email.gsub(/./) { sprintf("&#x%02X;", $&.unpack("U")[0]) }
  end

  def render_markdown_links(text)
    return '' if text.nil? || text.empty?
    text.gsub(/\[([^\]]+)\]\(([^)]+)\)/) do
      link_text = $1
      url = $2
      if url.start_with?('mailto:')
        email = url.sub('mailto:', '')
        %Q{<a href='mailto:#{encode_email(email)}'>#{link_text}</a>}
      else
        %Q{<a href='#{url}' target='_blank' rel='noopener'>#{link_text}</a>}
      end
    end
  end

  GERMAN_MONTHS = %w[Januar Februar März April Mai Juni Juli August September Oktober November Dezember].freeze

  def format_german_date(iso_date)
    return nil unless iso_date =~ /^(\d{4})-(\d{2})-(\d{2})$/
    day = $3.to_i
    month = GERMAN_MONTHS[$2.to_i - 1]
    year = $1
    "#{day}. #{month} #{year}"
  end
end
