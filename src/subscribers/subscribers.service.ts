import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) private subscriberModel: SoftDeleteModel<SubscriberDocument>) {}
  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const { name, skills, email } = createSubscriberDto;
    const isExist = await this.subscriberModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`${name} đã tồn tại trên hệ thống `);
    }
    const newSubscriber = await this.subscriberModel.create({
      name,
      skills,
      email,
      createdBy: {
        _id: user?._id,
        email: user?.email
      }
    });
    return {
      _id: newSubscriber?._id,
      createdAt: newSubscriber?.createdAt
    };
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
    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found subscriber with id ');
    }
    return await this.subscriberModel.findById(id);
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    const updated = await this.subscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user?._id,
          email: user?.email
        }
      },
      { upsert: true }
    );
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found subscriber with id ');
    }
    await this.subscriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user?._id,
          email: user?.email
        }
      }
    );
    return this.subscriberModel.softDelete({ _id: id });
  }
  async getSkills(user: IUser) {
    const { email } = user;
    return await this.subscriberModel.findOne({ email }, { skills: 1 });
  }
}
