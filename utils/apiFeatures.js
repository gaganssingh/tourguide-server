class APIFeatures {
	constructor (query, queryString) {
		this.query = query;
		this.queryString = queryString;
	}

	filter () {
		// BUILD QUERY
		// 1a. Fintering
		const queryObj = { ...this.queryString };
		// Fields that need to be excluded from the req.query object
		const excludedFields = [ "page", "sort", "limit", "fields" ];
		excludedFields.forEach((el) => delete queryObj[el]);

		// 1b. Advanced Filtering
		let queryString = JSON.stringify(queryObj);
		// {difficulty: "easy", duration: {$gre: 5}}
		// replace {gte, gt, lte, ls} with {$gte, $gt, $lte, $ls}
		queryString = queryString.replace(
			/\b(gte|gt|lte|lt)\b/g,
			(match) => `$${match}`
		);

		// Query the database
		this.query = this.query.find(JSON.parse(queryString));

		return this;
	}

	sort () {
		// 2. Sorting
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(",").join(" ");
			// Using default mongoose ".sort" method
			this.query = this.query.sort(sortBy); // sort("price ratingsAverage")
		} else {
			// default
			// sort by creation date -> newest one first
			this.query = this.query.sort("-createdAt");
		}

		return this;
	}

	limitFields () {
		// 3. Field Limiting
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(",").join(" ");
			// Using default mongoose ".select" method
			this.query = this.query.select(fields); // select("name duration difficulty")
		} else {
			// default
			// receive every field except __v
			this.query = this.query.select("-__v");
		}
		return this;
	}

	paginate () {
		// 4. Pagination & Limiting
		// ?page=2&limit=10
		const page = Number(this.queryString.page) || 1;
		const limit = Number(this.queryString.limit) || 100;
		const skip = (page - 1) * limit; // For page 3 -> need to skip 200 results

		this.query = this.query.skip(skip).limit(limit);

		return this;
	}
}

module.exports = APIFeatures;
