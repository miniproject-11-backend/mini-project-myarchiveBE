const CustomError = require("../middlewares/errorhandler.js");
const bcrypt = require('bcrypt');

const UserRepository = require("../repositories/users.repositories.js")
class UserService {
    constructor() {
        this.UserRepository = new UserRepository();
    }
    findById = async ({ accountId }) => {
        const check = await this.UserRepository.findById({ accountId })
        return check;
    }
    findByNick = async ({ nick }) => {
        const check = await this.UserRepository.findByNick({ nick })
        console.log(check)
        return check;
    }
    createUser = async ({ accountId, password, nick }) => {
        await this.UserRepository.createUser({ accountId, password, nick })
    }
    checkUser = async ({ accountId, password, nick }) => {
        const regex = /^[a-zA-Z0-9]{4,}$/; //정규 표현식: 조건 알파벳과숫자로 이루어진 4글자 이상

        // 아이디 비밀번호 정규식 체크
        if (!regex.test(accountId)) {
            // console.log(accountId + " = 형식이 일치하지 않습니다");
            throw new CustomError("아이디 형식이 일치하지 않습니다.", 412)
        } else if (!regex.test(password)) {
            // console.log(password + " = 형식이 일치하지 않습니다");
            throw new CustomError("패스워드 형식이 일치하지 않습니다.", 412)
        }

        //닉네임,아이디 중복 체크
        const checkNick = await this.UserRepository.findByNick({ nick })
        const checkId = await this.UserRepository.findById({ accountId })

        if (checkNick) {
            throw new CustomError("중복된 닉네임입니다.", 412)
        } else if (checkId) {
            throw new CustomError("중복된 아이디입니다.", 412)
        }
    }
    checkloginUser = async ({ accountId, password }) => {
        const user = await this.UserRepository.findById({ accountId })
        if (!user) {
            throw new CustomError("존재하지 않는 유저입니다.", 401)
        }
        //암호화된 패스워드 검증
        const checkpassword = await bcrypt.compare(password, user.password);
        if (checkpassword) {
            return user;
        } else if (!checkpassword) {
            throw new CustomError("비밀번호가 일치하지 않습니다.", 412)
        }
    }

}

module.exports = UserService;