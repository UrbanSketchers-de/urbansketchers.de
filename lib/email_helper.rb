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

  # "Gegründet am 4. Juni 2015" for YYYY-MM-DD, "Gegründet im Juni 2015" for YYYY-MM, nil for a bare year.
  def founded_title(iso_date)
    case iso_date
    when /^(\d{4})-(\d{2})-(\d{2})$/ then "Gegründet am #{$3.to_i}. #{GERMAN_MONTHS[$2.to_i - 1]} #{$1}"
    when /^(\d{4})-(\d{2})$/ then "Gegründet im #{GERMAN_MONTHS[$2.to_i - 1]} #{$1}"
    end
  end
end
