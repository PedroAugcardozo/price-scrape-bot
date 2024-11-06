const puppeteer = require('puppeteer')
const sqlite3 = require('sqlite3').verbose();

function initializeDataBase() {
    const db = new sqlite3.Database('Produtos.db')
    db.serialize(() =>{
        db.run(`
            CREATE TABLE IF NOT EXISTS Produtos(
                id INTEGER PRIMARY KEY,
                url TEXT,
                preco TEXT
            );    
        `)
    });
    return db;
}

function saveToDataBase(db, url, preco) {
    db.run(`INSERT INTO Produtos (url, preco) VALUES (?, ?)`, [url, preco], function(err){
        if(err){
            console.log('Erro ao salvar no banco de dados:', err)
        } else {
            console.log(`preço salvo: ${preco} - url ${url}`)
        }
    });
}

async function scrapePrice(url) {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage('');
    await page.goto(url);

    const price = await page.evaluate(() => {
        return document.querySelector('.a-price-whole')?.innerText || 'preco nao encontrado';
    })

    await browser.close();
    return price
}

async function main(){
    const db = initializeDataBase();
    const urls = [
        'https://www.amazon.com.br/Smartwatch-Rel%C3%B3gio-Inteligente-Watch-HZ-Z15/dp/B0BWSB7SBF?pd_rd_w=DWWzN&content-id=amzn1.sym.542c7bd7-c731-4f59-89f9-93f07e321553&pf_rd_p=542c7bd7-c731-4f59-89f9-93f07e321553&pf_rd_r=BA49MEY66V89ZQHCBCW1&pd_rd_wg=KB5mH&pd_rd_r=223e2aee-ceb7-41ef-b47c-6022efe3a856&pd_rd_i=B0BWSB7SBF&ref_=pd_hp_d_btf_hgg-selecaodeprodutos_B0BWSB7SBF&th=1',

        'https://www.amazon.com.br/Controle-Dualshock-TGT-compat%C3%ADvel-TGT-AC130/dp/B0848MK8BR?pd_rd_w=DWWzN&content-id=amzn1.sym.542c7bd7-c731-4f59-89f9-93f07e321553&pf_rd_p=542c7bd7-c731-4f59-89f9-93f07e321553&pf_rd_r=BA49MEY66V89ZQHCBCW1&pd_rd_wg=KB5mH&pd_rd_r=223e2aee-ceb7-41ef-b47c-6022efe3a856&pd_rd_i=B0848MK8BR&ref_=pd_hp_d_btf_hgg-selecaodeprodutos_B0848MK8BR',

        'https://www.amazon.com.br/M%C3%A1quina-Multifuncional-El%C3%A9trico-Triturador-Inoxid%C3%A1vel/dp/B0CFG9ZMRL?pd_rd_w=DWWzN&content-id=amzn1.sym.542c7bd7-c731-4f59-89f9-93f07e321553&pf_rd_p=542c7bd7-c731-4f59-89f9-93f07e321553&pf_rd_r=BA49MEY66V89ZQHCBCW1&pd_rd_wg=KB5mH&pd_rd_r=223e2aee-ceb7-41ef-b47c-6022efe3a856&pd_rd_i=B0CFG9ZMRL&ref_=pd_hp_d_btf_hgg-selecaodeprodutos_B0CFG9ZMRL&th=1',

        'https://www.amazon.com.br/PlayStation%C2%AE5-Slim-Edi%C3%A7%C3%A3o-Digital-Jogos/dp/B0CYJBWGH5/?_encoding=UTF8&pd_rd_w=tihbE&content-id=amzn1.sym.52e74d21-088e-4a9d-888d-8b14bf95d4ae&pf_rd_p=52e74d21-088e-4a9d-888d-8b14bf95d4ae&pf_rd_r=BA49MEY66V89ZQHCBCW1&pd_rd_wg=KB5mH&pd_rd_r=223e2aee-ceb7-41ef-b47c-6022efe3a856&ref_=pd_hp_d_btf_crs_zg_bs_7791985011'
    ]

    for(const url of urls){
        try{
            const preco = await scrapePrice(url);
            saveToDataBase(db,url,preco)
        }catch(error){
            console.log(`erro ao processar ${url}`, error)
        }
    }

    db.close
} 

main();