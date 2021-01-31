from time import sleep
import os
import cv2
import pytesseract
from PIL import Image
from PyPDF2 import PdfFileMerger, PdfFileReader
import json 
from pathlib import Path
import sys

book_name = sys.argv[1]
book_count = (sys.argv[2]).split(",")
print (book_name)
print (book_count)
pytesseract.pytesseract.tesseract_cmd = "C://Program Files//Tesseract-OCR//tesseract.exe"
TESSDATA_PREFIX = "C://Program Files//Tesseract-OCR"
tessdata_dir_config = '--tessdata-dir "C://Program Files//Tesseract-OCR//tessdata"'
mergedObject = PdfFileMerger()

i = 1
for x in book_count: # looping on images folder and convert to pdf files 

    png = x+"png"
    jpg = x+"jpg"

    os.rename(png, jpg)

    input_dir = "./images/"+str(i)+".jpg"
    img = cv2.imread(input_dir, 1)
    resulte = pytesseract.image_to_pdf_or_hocr(img, lang="eng", config=tessdata_dir_config)

    pages = "./pages/"+str(i)+".pdf"
    f = open(pages, "w+b")
    f.write(bytearray(resulte))
    f.close()

    mergedObject.append(PdfFileReader("./pages/"+ str(i)+ '.pdf', 'rb'))

    os.remove(jpg)
    os.remove("./pages/"+ str(i)+ '.pdf')
    i += 1    

mergedObject.write(book_name+".pdf") # merge all pdf files in one pdf file
print("Book Download Successfuly!")