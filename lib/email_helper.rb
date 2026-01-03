module EmailHelper
  def encode_email(email)
    email.gsub(/./) { sprintf("&#x%02X;", $&.unpack("U")[0]) }
  end

  def render_markdown_links(text)
    return '' if text.nil? || text.empty?
    text.gsub(/\[([^\]]+)\]\(([^)]+)\)/) do
      %Q{<a href="#{$2}" target="_blank" rel="noopener">#{$1}</a>}
    end
  end
end
