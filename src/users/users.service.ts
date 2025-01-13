import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  findOneByUserName(username: string) {
    return this.userModel.findOne({ email: username }).populate({ path: 'role', select: { name: 1 } });
  }

  isValidPassWord(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, address, age, company, gender, password, role } = createUserDto;
    const isExit = await this.userModel.findOne({ email });
    if (isExit) {
      throw new BadRequestException('Email đã tồn tại. Vui lòng chọn email khác');
    }
    const newUser = await this.userModel.create({
      name,
      email,
      address,
      age,
      gender,
      role,
      password: this.getHashPassword(password),
      company,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return newUser;
  }

  async register(user: RegisterUserDto) {
    const { email, password, name, address, age, gender } = user;
    const isExit = await this.userModel.findOne({ email });
    if (isExit) {
      throw new BadRequestException('Email đã tồn tại. Vui lòng chọn email khác');
    }
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });
    const newRegister = await this.userModel.create({
      name,
      email,
      gender,
      address,
      age,
      password: this.getHashPassword(password),
      role: userRole?._id
    });
    return newRegister;
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    if (filter.name) {
      filter.name = { $regex: new RegExp(filter.name, 'i') };
    }
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return {
        code: 500,
        message: 'Not found users'
      };
    return await this.userModel
      .findOne({ _id: id })
      .select('-password')
      .populate({ path: 'role', select: { name: 1, _id: 1 } });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return {
        code: 500,
        message: 'Not found users'
      };
    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Tài khoảng Admin không thể xóa ');
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
    return this.userModel.softDelete({ _id: id });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };
  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken }).populate({ path: 'role', select: { name: 1 } });
  };
}
