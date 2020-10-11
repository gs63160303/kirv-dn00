const math = require('mathjs');

const P =
	'ECTARAKNNIIGDABHAETUFAIUAGDLRENAINDNEHATGRNETDSOADROTEHWCEIHROGBEOEDALNPELTPSHESPEAPSEELWRLAAEWSUOTCNENAADDBTUHOTEMIWTEHTNEEHBAGTENOORRGWIIEWPTAOFNSUDAHETTVNRGEIHNOOTEFEHWTMAOGESNTKENHIGCEMBAERENVAGTAHRTINAOSDRREDDETGERHADENTEROEEWKPAHCLTALGITNHUEDTNRHRTEEETGERHADENSEREIHETSLSESDTOOTANWTBHTCUAUOTBTWVLOEECCOHLKELEAFLSEEALPNNIHDTEROIMNNNATGOHORTEFHPALEPEAWMSSIISGSNTNEHHTECENSODNOASWSDRROEEOTADWTAHDCNAIMNTDITHEGHTFOLOELLSEAEPDNNAITMERHONGNNIAOEHATRPELAPWSNOTGEHTNEEHTRISHDOFOENFRTDKEOEWPTEACUBTHTHAGDERERETNAFSRWITODLOUNTTEILHMROEFFAOSERMHMRHASODLOUCMOTIEHMWOVHEETAARLSEHOTCNNEESTDDNHATENUMOGAALDNIHSMLIEFDNRUETTEEHREWOTTAC';
const C =
	'TCREAANNIKIGBAADHEFUITAUDGRALEIADNNNAHGETRTESNDORDTAOECWIHEHGOERBOADNELPTLSEPHPSAEEPEEWSLRAAWLESTONUCEAADNDBHUTTOEWIEMTHENHTEBTGNAEORRWOGIWETIPANFUOSDEHTATVGRINEHOOENTFWHMETAEGNOSTNEIKHGMEACBENEARVGHATTRIOADNSRDEERDTREAGHDTNREEOWEPEKALCAHTLTIHGNUTDRENHETERETREAGHDSNREEEEHSITLSETSDOATWONTTHUBCATOTUBWOLEVECHOKCLEAELLFSAEPELNHITNDEIONRMNTAONGHTRFOEHLAPPEEMWSASIGSNISTHETNHENEOCSDAOWNSSRREDOEATWODTDHNACANMDITIEHHTGTLOEFOLESELAPNNIDATREOMHNNNAGIOAHRETPALWEPSTOENGHENHTETSIDRHOEOFFNRKDOTEETPAWECTBTUHHDGRAEETEARNFWRTSIOOLNDUTIEHTLMEOFRFAESMORHHRSMAOOLCDUMITHOEMVOEWHEAALTRSOHCETNEETNSDHNTDAEMUGNOADLIANHLMESIFRNEDUTEERTHETOAWTC';
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXY';

const VERBOSE_NONE = 0,
    VERBOSE_MINIMAL = 1,
    VERBOSE_INFO = 2,
    VERBOSE_DETAIL = 3

/**
 * 
 */
const VERBOSE_LEVEL = VERBOSE_DETAIL

const print = (verboseLevel, ...args) => {
    if (verboseLevel <= VERBOSE_LEVEL) {
        console.log(...args)
    }
}

/**
 * @param {any[]} array
 * @param {number} n Number of chunks to split the array into
 * @param {any} fill What to fill the not full chunks with
 */
const chunk = (array, n, fill) => {
	array =
		fill !== undefined ? array.concat(Array(array.length % n).fill(0)) : array;
	return Array(Math.ceil(array.length / n))
		.fill()
		.map((_, i) => array.slice(i * n, i * n + n));
};

/**
 * @param {number} [...]
 */
const gcd = (...n) => n.length === 2 ? n[1] ? gcd(n[1], n[0] % n[1]) : n[0] : n.reduce((a, c) => a = gcd(a, c))

/**
 * @param {string} text
 * @param {string} alphabet
 * @returns {number[]}
 */
const encode = (text, alphabet) =>
	Array.from(text.toUpperCase()).map(char =>
		alphabet.toUpperCase().indexOf(char)
	);

/**
 * @param {number[]} array
 * @param {string} alphabet
 * @returns {string}
 */
const decode = (array, alphabet) =>
	array.map(index => alphabet[index]).join('');

/**
 * @param {math.Matrix} key
 * @param {number[]} plaintext Encoded plaintext
 * @returns {number[]}
 */
const hillEncrypt = (key, plaintext, alphabetSize) => {
    console.log(key, plaintext, alphabetSize)
	const size = key.size();
	if (size.length !== 2 || size[0] !== size[1]) {
		throw Error(
			`Invalid key matrix. Key has to be a square matrix. key.size(): ${size}`
		);
	}
	
	const det = math.det(key)
	
	if (det === 0 || gcd(det, alphabetSize) !== 1) {
	    throw Error(`Invalid key matrix. Matrix has to be invertible and its determinant has to be coprime with alphabet length.`);
	}

	/** @type {number} */
	const m = size[0];

	/** @type {math.Matrix[]} */
	const ngrams = chunk(plaintext, m, 0).map(ngram => math.matrix(ngram));

	return ngrams
		.map(ngram => math.mod(math.multiply(key, ngram), alphabetSize).toArray())
        .flat();
}

/**
 * @param {math.Matrix} key
 * @param {number[]} ciphertext Encoded ciphertext
 * @returns {number[]} encoded plaintext
 */
const hillDecrypt = (key, plaintext, alphabetSize) => {
    const inverseKey = math.mod(math.inv(key), alphabetSize);
    console.log(`Inversed key: ${inverseKey}`)
    return hillEncrypt(inverseKey, plaintext, alphabetSize);
}


/**
 * Count in base <max>. Increment number represented
 * with array (big endian representation).
 * @param {number[]} arr 
 * @param {number} ix Position in number where we want to incremet
 * @param {number} max Max number in array - same as bas eof number.
 * @returns {number[]} Array that represents number incremented by one.
 */
const inc = (arr, ix, max) => {
    if (ix >= arr.length) {
        return false
    }
    if (arr[ix] === max) {
        arr[ix] = 0
        return inc(arr, ix + 1, max)
    }
    arr[ix] += 1
    return arr
}

/**
 * 
 * @callback ForEverySquareMatrixCallback
 * @param {math.Matrix} matrix
 * @returns {any} truthy value if key is found and therefore search 
 * should be ended.
 */

/**
 * Iterative deepening search in square matrix of size <size> space
 * @param {number} size Size of square matrix to search in.
 * @param {number} max Maximum number of values in matrix.
 * @param {ForEverySquareMatrixCallback} fun Function that is called 
 * for every matrix. If this function returns thruthy value, current 
 * matrix is returned.
 * @returns {math.Matrix|boolean} Matrix that is considered solution of search
 * or false if there is no solution.
 */
const forEverySquareMatrix = (size, max, fun) => {
    let curMax = 1

    // Gradually increase <curMax> - iterative deepening.
    while (curMax <= max) {
        let arr = Array(Math.pow(size, 2)).fill(0)
        
        // Iterate over matrices of size <size> where its 
        // values are less or equal to <curMax>.
        while (true) {
            const key = math.matrix(chunk(arr, size))

            print(VERBOSE_DETAIL, `Trying key: ${key}`)

            // TryToDerypt part.
            if (fun(key)) {
                // If this key decrypts, return it.
                // console.log(`KEY FOUND: ${key}`)
                return key
            }
            
            // If key does not decrypt, try next matrix as the key.
            arr = inc(arr, 0, curMax)
            if (arr === false) {
                // If all matrices of size <size> and max value <curMax>
                // have been checked, double <curMax>.
                break
            }
        }
        curMax *= 2
    }
    // If no key of size <size> decrypts this cipher.
    return false
}

/**
 * @callback TryToDecryptCallback
 * @param {math.Matrix} K the key that we try to decrypt with.
 * @returns {boolean} Whether the key encrypts plaintext with ciphertext.
 */

/**
 * @param {number[]} P encoded plaintext
 * @param {number[]} C encoded expected ciphertext
 * @param {string} A alphabet
 * @param {number} m size of the key
 * @returns {}
 */
const tryToDecrypt = (P, C, A, m) => {
    /** @type {math.Matrix} */
    const ngrams = chunk(P, m, 0).map(ngram => math.matrix(ngram));

    /** @type {number} */
    const alphabetSize = A.length

    return K => {
        /** @type {number} Size of the key */
        const size = K.size();

        // Skip if key dimensions are invalid.
        if (size.length !== 2 || size[0] !== size[1]) {
            return false
        }
        
        /** @type {number} Determinant of the key matrix. */
        const det = math.det(K)
        
        // Skip this key if the matrix is not invetrable,
        // or the determinant is not coprime with alphabet size.
        if (det === 0 || gcd(det, alphabetSize) !== 1) {
            return false
        }

        /** @type {number[]} Array representing the ecrypted value */
        const encrypted = ngrams
            .map(ngram => math.mod(math.multiply(K, ngram), alphabetSize).toArray())
            .flat();

        // Check whether encypted value is same as expected ciphertext.
        encrypted.forEach((x, i) => {

        })
        for (let i = 0; i < encrypted.length; i++) {
            if (encrypted[i] !== C[i]) {
                return false
            }
        }
        console.log('ARE SAME:', encrypted, C)
        return true
        const same = !encrypted.some((x, i) => x !== C[i])
        if (same) {
            console.log('ARE SAME:', encrypted, C)
        }
        return same;
    }
}

/**
 * Brute force decrypt Hill Cipher
 * @param {string} plaintext 
 * @param {string} ciphertext 
 * @param {string} alphabet 
 * @returns {math.Matrix|boolean} Returns the key or false if no key is found.
 */
const bruteForceFindKey = (plaintext, ciphertext, alphabet) => {
    const maxNumberInMatrix = 4;
    const maxMatrixSize = 4;
    for (let matrixSize = 2; matrixSize <= maxMatrixSize; matrixSize++) {
        print(VERBOSE_INFO, `Searching for ${matrixSize}x${matrixSize} matrix ...`)

        // For every square matrix of size <matrixSize> and maximum value 
        // of <maxNumberInMatrix> try to find such key of size <size> that encrypts 
        // plaintext <plaintext> into ciphertext <ciphertext> using alphabet <alphabet>.
        const key = forEverySquareMatrix(
            matrixSize, 
            maxNumberInMatrix, 
            tryToDecrypt(
                encode(plaintext, alphabet), 
                encode(ciphertext, alphabet), 
                alphabet, 
                matrixSize
            )
        )

        if (key) {
            return key
        }
    }
    return false
}

console.log(decode(hillEncrypt(math.matrix([[1,1,1],[0,0,1],[1,0,0]]), encode('TelekomSlovenijeGrego', A), A.length), A))

const ciphertext = C// 'JLTDOEQLMOEOFJNCREYOE'
const plaintext = P// 'TelekomSlovenijeGrego'

const key = bruteForceFindKey(plaintext, ciphertext, A)

if (key) {
    const decodedOrigimalMsg = decode(hillDecrypt(key, encode(ciphertext, A), A.length), A)
    console.log('Decoded original message:', decodedOrigimalMsg)
}

/*
print(VERBOSE_MINIMAL, 'Brute force decrypting ...')

const key = bruteForceFindKey(P, C, A)

print(VERBOSE_MINIMAL, key ? `Key found: ${math.matrix(key)}` : 'Key not found.')

if (key) {
    // If key is found, try to decrypt plaintext with its inverse.
    const decodedOrigimalMsg = decode(hillDecrypt(key, encode(P, A), A.length), A)
    print(VERBOSE_NONE, `Original message was: ${decodedOrigimalMsg}`)
}

return key
*/