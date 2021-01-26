// Scrape webdsite for the Korean word of the day
let websiteURL = "https://krdict.korean.go.kr/mainAction?flag=PC"

let reqWebsite = new Request(websiteURL)
let html = await reqWebsite.loadString()

// Comments in the webpage mark the beginning and end of today's Korean word
let todayStart = html.indexOf("<!-- 오늘의 한국어 -->")
let todayStop = html.indexOf("<!--// 오늘의 한국어 -->")
let todaySection = html.substring(todayStart, todayStop)
let reSearchDetail = /href="javascript:searchDetailView\('\d+','Y'\);">/
let matchSearchDetail = todaySection.match(reSearchDetail)
let reWordNumber = /\d+/
let matchWordNumber = matchSearchDetail[0].match(reWordNumber)



// Korean dictionary API: https://krdict.korean.go.kr/openApi/openApiInfo
// Query parameters
/*
IMPORTANT: You need to request an API key from the Korean Dictionary API and paste it in the 'key' constant below.
*/
const key = ""
let encodedWordNumber = encodeURIComponent(matchWordNumber)

let url = "https://krdict.korean.go.kr/api/view?key="+ key + "&method=TARGET_CODE&q=" + encodedWordNumber + "&translated=y&trans_lang=1"
let request = new Request(url)
let response = await request.loadString()


// XML parsing
let elementName = ""
let currentValue = null
let items = []
let currentItem = null
const xmlParser = new XMLParser(response)
xmlParser.didStartElement = name => {
    currentValue = ""
    if (name == "word_info") {
        currentItem = {}
    }
}

xmlParser.didEndElement = name => {
    const hasItem = currentItem != null
    if (hasItem && name == "word") {
        currentItem["word"] = currentValue
    }
    if (hasItem && name == "trans_word") {
        currentItem["trans_word"] = currentValue
    }
    
    if (name == "item") {
        items.push(currentItem)
        currentItem = {}
    }
}

xmlParser.foundCharacters = str => {
    currentValue += str
}

xmlParser.didEndDocument = () => {
    
}

xmlParser.parse()
items = items[0]


// Widget
var widget = new ListWidget()
widget.addText(items["word"])
widget.addText(items["trans_word"])
Script.setWidget(widget)
