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
end
