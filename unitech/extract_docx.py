import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract(docx_path, output_path):
    try:
        # Resolve the actual path in case it contains spaces or unicode
        full_docx_path = os.path.abspath(docx_path)
        with zipfile.ZipFile(full_docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            WORD_NAMESPACE = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
            PARA = WORD_NAMESPACE + 'p'
            TEXT = WORD_NAMESPACE + 't'
            
            paragraphs = []
            for paragraph in tree.iter(PARA):
                texts = [node.text for node in paragraph.iter(TEXT) if node.text]
                if texts:
                    paragraphs.append(''.join(texts))
            
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(paragraphs))
            print("Extract success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    # Specify exact path to avoid powershell unicode execution issues
    extract(r"c:\unitech\unitech\Chuyên đề tốt nghiệp.docx", r"c:\unitech\unitech\chuyen_de.txt")
