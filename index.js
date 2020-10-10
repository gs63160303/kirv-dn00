const math = require('mathjs');

/**
 * @param {} array 
 * @param {number} n Number of chunks to split the array into
 * @param {any} fill What to fill the not full chunkks with
 */
const chunk = (array, n, fill) => {
    array = fill !== undefined ? array.concat(Array(array.length % n).fill(0)) : array
    return Array(Math.ceil(array.length / n))
        .fill()
        .map((_, i) => array.slice(i * n, i * n + n))
}

/**
 * @param {string} text 
 * @param {string} alphabet 
 * @returns {number[]}
 */
const encode = (text, alphabet) => 
    Array.from(text.toUpperCase())
    .map(char => alphabet.toUpperCase().indexOf(char))

/**
 * @param {number[]} array 
 * @param {string} alphabet 
 * @returns {string}
 */
const decode = (array, alphabet) =>
    array.map(index => alphabet[index])
    .join('')

/**
 * @param {Array.<number[]>} key 
 * @param {number[]} plaintext Encoded plaintext
 * @returns {number[]}
 */
const hillEncrypt = (key, plaintext, alphabetSize) => {
    const K = math.matrix(key)
    const size = K.size()
    if (size.length !== 2 || size[0] !== size[1]) {
        throw Error(`Invalid key. Key has to be a square matrix. key.size(): ${size}`)
    }

    /** @type {number} */
    const m = size[0]

    /** @type {math.Matrix[]} */
    const ngrams = chunk(plaintext, m, 0)
        .map(ngram => math.matrix(ngram));

    return ngrams
        .map(ngram => 
            math.mod(math.multiply(key, ngram), alphabetSize).toArray()
        )
        .flat()
}

const P = 'ECTARAKNNIIGDABHAETUFAIUAGDLRENAINDNEHATGRNETDSOADROTEHWCEIHROGBEOEDALNPELTPSHESPEAPSEELWRLAAEWSUOTCNENAADDBTUHOTEMIWTEHTNEEHBAGTENOORRGWIIEWPTAOFNSUDAHETTVNRGEIHNOOTEFEHWTMAOGESNTKENHIGCEMBAERENVAGTAHRTINAOSDRREDDETGERHADENTEROEEWKPAHCLTALGITNHUEDTNRHRTEEETGERHADENSEREIHETSLSESDTOOTANWTBHTCUAUOTBTWVLOEECCOHLKELEAFLSEEALPNNIHDTEROIMNNNATGOHORTEFHPALEPEAWMSSIISGSNTNEHHTECENSODNOASWSDRROEEOTADWTAHDCNAIMNTDITHEGHTFOLOELLSEAEPDNNAITMERHONGNNIAOEHATRPELAPWSNOTGEHTNEEHTRISHDOFOENFRTDKEOEWPTEACUBTHTHAGDERERETNAFSRWITODLOUNTTEILHMROEFFAOSERMHMRHASODLOUCMOTIEHMWOVHEETAARLSEHOTCNNEESTDDNHATENUMOGAALDNIHSMLIEFDNRUETTEEHREWOTTAC';
const C = 'TCREAANNIKIGBAADHEFUITAUDGRALEIADNNNAHGETRTESNDORDTAOECWIHEHGOERBOADNELPTLSEPHPSAEEPEEWSLRAAWLESTONUCEAADNDBHUTTOEWIEMTHENHTEBTGNAEORRWOGIWETIPANFUOSDEHTATVGRINEHOOENTFWHMETAEGNOSTNEIKHGMEACBENEARVGHATTRIOADNSRDEERDTREAGHDTNREEOWEPEKALCAHTLTIHGNUTDRENHETERETREAGHDSNREEEEHSITLSETSDOATWONTTHUBCATOTUBWOLEVECHOKCLEAELLFSAEPELNHITNDEIONRMNTAONGHTRFOEHLAPPEEMWSASIGSNISTHETNHENEOCSDAOWNSSRREDOEATWODTDHNACANMDITIEHHTGTLOEFOLESELAPNNIDATREOMHNNNAGIOAHRETPALWEPSTOENGHENHTETSIDRHOEOFFNRKDOTEETPAWECTBTUHHDGRAEETEARNFWRTSIOOLNDUTIEHTLMEOFRFAESMORHHRSMAOOLCDUMITHOEMVOEWHEAALTRSOHCETNEETNSDHNTDAEMUGNOADLIANHLMESIFRNEDUTEERTHETOAWTC';
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXY';

const encrypted = hillEncrypt(
    [[1, 0], [0, 1]],
    encode(P, A),
    A.length
)

console.log(decode(encrypted, A))